import logger from 'nandos-dev-logger'

import Vue from 'vue'
import { MENU_CHANGED } from 'nandos-middleware-api/service/menu/menu-service'
import { ORDER_TYPES } from 'nandos-middleware-api/model/food-basket'
import { CATEGORY_DISPLAY_TYPES } from 'nandos-middleware-api/model/menu-category'
import Tracker from '../../e-commerce-tracker-adapter'
import OrderTypeKey from 'nandos-i18n/src/filters/order-type-key'
import { ViewStateService, debounce, RouterUtils } from 'nandos-core-ui'
import { provideCommonServices } from '../../utils/ordering-provider-utils'

import { BASKET_CONTENTS_CHANGED } from 'nandos-middleware-api/service/basket/basket-service'

const MAX_RECENT_SEARCHES = 5
const RECENT_SEARCHES_STORAGE_KEY = 'nandos-recent-search-products'

export default {

	mixins: [RouterUtils],

	props: {
	  menuService: { type: Object, required: true },
	  basketService: { type: Object, required: true },
	  languageService: { type: Object, required: true },
	  globalConfigService: { type: Object, required: true },	  
	  storeService: { type: Object, required: false }, /*Required when not in preview mode*/
	  
	  path: { type: String },
	  preview: { type: Boolean },
	  warnIfCustomerLocationIsFarFromStore: { type: Boolean, default: true }, /* Use menu-change-address-prompt component */
	},

	provide: provideCommonServices,

	data () {
		return {
			viewState: ViewStateService,
			basket: null,
			quickLinks: null,

			searchQuery: null,
			searchContext: 'text', // text or voice
			queuedUpdateQueryStringCall: null, // keeps track of last debounced call to updateQueryString
			voiceSearchResult: {},
			voiceSearchAvailable: false,
			recentSearches: JSON.parse(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)) || [],
		}
	},

	computed: {

		ready() {
			return this.basket != null && this.quickLinks != null
		},

		pageTransition() {
		  switch(this.viewState.lastNavigationDirection) {
		    case 'up': return 'page-slide-left-to-right'
		    case 'down': return 'page-slide-right-to-left'
		  }
		},

		page_title() {
			if(this.ready) {
				if(this.basket.isOrderSetup) {
					let basket = this.basket;
					let basketTime = new Date(this.basket.orderTime);

					let time = (basket.orderTime === 0 || basketTime.getTime() < this.basketService.firstAvailableTimeSlot.getTime())
						? this.$t('menu.timeAsap')
						: this.$options.filters.date(basket.orderTime, 'time')

					return this.$t(`menu.pageTitle.${OrderTypeKey(basket)}`, {time, address: basket.deliveryAddress, store: basket.storeName})
				}
				else {
					return this.$t('menu.chooseStorePrompt')
				}
			}
		},

		is_menu_root() {
			return !this.path && !this.hasSearchQuerey
		},

		hasSearchQuerey() {
			return (this.searchQuery != '' && this.searchQuery != null)
		},

		showFooter() {
			return this.ready && this.basket.totalItems > 0
		},

		isDesktopLayout() { return this.$breakpoints.mdUp },

		isMobileLayout() { return !this.isDesktopLayout },
	},

	watch: {		
    searchQuery(val) {
      this.queuedUpdateQueryStringCall = this.debouncedUpdateQueryString(val)
  	},

    voiceSearchResult: {
      handler() {
        this.searchQuery = this.voiceSearchResult.text
      },
      deep: true
    },

    '$route.query.query'(val) {
    	this.searchQuery = val
    },
  },

	created() {

		this.menuService.addObserver(this, MENU_CHANGED, () => this.getMenuQuickLinks())
		this.basketService.addObserver(this, BASKET_CONTENTS_CHANGED, () => this.getBasket());

		if(this.storeService == null && this.preview != true) {
			logger.error('Nandos Ordering', 'Missing required dependency `storeService`', 'A store service is required when not in preview mode')
		}

		this.debouncedUpdateQueryString = debounce(this.updateQueryString, 1300)

		if(this.$route.query.query) this.searchQuery = this.$route.query.query;
		
		Promise.all([this.getBasket(), this.getMenuQuickLinks()])
	},


	beforeRouteLeave(to, from, next) {
		// Make sure debounced function doesn't change route when user is trying to navigate to another page
		if(this.queuedUpdateQueryStringCall) {
		  clearTimeout(this.queuedUpdateQueryStringCall)
		  // Manually track the last search result with GA
		  Tracker.track('search', `${this.$router.options.base}/menu`, {
		  	'query': this.searchQuery,
		  	'search-ctx': this.searchContext,
		  })
		}

		next();
	},

	methods: {

		getMenuQuickLinks() {
			return this.menuService.getQuickLinks()
				.then(quickLinks => this.quickLinks = quickLinks)
		},

		getBasket() {
			return this.basketService.getBasketSummary()
				.then(basket => this.basket = basket)
		},

		updateQueryString (searchTerm) {
		  this.queuedUpdateQueryStringCall = null
		  let queryComponents = searchTerm ? {'query': searchTerm, 'search-ctx': this.searchContext} : null
		  this.$router.replace({path: this.$route.path, query: queryComponents })
		},

		onSpeechToTextError(error) {
		  switch(error) {
		    case 'aborted': break; // We can treat this as "speech end"?
		    case 'unavailable': this.voiceSearchAvailable = false; break;
		    case 'no-speech': this.$toaster.show(this.$t('speechToText.errors.noSpeech'), {parent: this}); break;
		    case 'network': this.$toaster.show(this.$t('speechToText.errors.network'), {parent: this}); break;
		    case 'audio-capture': this.$toaster.show(this.$t('speechToText.errors.audioCapture'), {parent: this}); break;
		    case 'not-allowed': this.$toaster.show(this.$t('speechToText.errors.notAllowed'), {parent: this}); break;
		    default: this.$toaster.show(this.$t('speechToText.errors.unknown'), {parent: this}); break;
		  }
		},

		onSearchResultClicked(item) {
			this.addRecentSearchProduct(item)
		},

		addRecentSearchProduct(item) {
			let recents = JSON.parse(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)) || []
			recents.unshift({id: item.idPath, name: item.name})
			
			recents = recents
				.filter((item, idx, arr) => arr.findIndex(s => s.id == item.id) == idx) // dedupe
				.slice(0, MAX_RECENT_SEARCHES)

			localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(recents))
		},

		goToSearchPage() {
			this.$router.push({name: this.preview ? 'preview-menu-search' : 'menu-search', query: this.$route.query });
		},
	},

	beforeDestroy() {
		this.menuService.removeObserver(this, MENU_CHANGED)
		this.basketService.removeObserver(this, BASKET_CONTENTS_CHANGED)
	},
}