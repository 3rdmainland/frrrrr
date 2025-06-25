import logger from 'nandos-dev-logger'

import Vue from 'vue'
import {MENU_CHANGED} from 'nandos-middleware-api/service/menu/menu-service'
import {ORDER_TYPES} from 'nandos-middleware-api/model/food-basket'
import {CATEGORY_DISPLAY_TYPES} from 'nandos-middleware-api/model/menu-category'
import Tracker from '../../e-commerce-tracker-adapter'
import OrderTypeKey from 'nandos-i18n/src/filters/order-type-key'
import {Restoreable, debounce, RouterUtils} from 'nandos-core-ui'
import NandosI18n from 'nandos-i18n'
import {getCategoryUrl, getProductUrl} from './menu-tile/menu-tile.js'
import {menuServiceKey, isPreviewKey} from '../../utils/ordering-provider-utils'
import PrefersReducedMotion from 'nandos-core-ui/src/utils/prefers-reduced-motion'

export default {

    inject: {
        menuService: menuServiceKey,
        preview: isPreviewKey,
    },

    mixins: [Restoreable, RouterUtils],

    props: {
        // via router
        path: {type: String},
        isSearch: {type: Boolean},
        isSuggested: {type: Boolean},
        // via parent view
        quickLinks: {type: Array},
        searchQuery: {type: String},
        voiceSearchAvailable: {type: Boolean},
        recentSearches: {type: Array},
    },

    data() {
        return {
            getCategoryUrl,
            getProductUrl,
            menuItem: null,
            menuItemChildren: null,
            show_jump_links: false,
            error: null,
            showProductDetail: false,

            showMobileHeader: false,
            search_results: null,

            pageContentEl: null,

            // Impression Tracking
            observer: null,
            trackableProductEls: [],
            productItems: null,
            trackedItems: [],
            exampleSearches: NandosI18n.i18nHasMessage('menu.searchInstructions.examples') ? this.$t('menu.searchInstructions.examples') : [],
        }
    },

    computed: {

        ready() {
            return this.menuItem != null || this.isSearch
        },

        is_menu_root() {
            return !this.path && !this.isSearch && !this.isSuggested
        },

        use_masonry_layout() {
            return !this.isSearch && this.menuItemChildren && this.menuItemChildren.some(child => child.isCategory)
        },

        accentColor() {
            if (this.isSearch)
                return this.showSearchInstructions ? '' : '#FEF938'
            else
                return this.menuItem.accentColor || ''
        },

        showSearchInstructions() {
            return this.isSearch && (this.search_results == null || this.search_results.length == 0)
        },

        searchCategorySuggestions() {
            return this.menuItemChildren && this.menuItemChildren.filter(item => item.isCategory)
        }
    },

    watch: {
        searchQuery(val) {
            if (val != null) {
                this.search()
            } else {
                this.search_results = []
            }
        },

        /**
         * When context changes between "normal" menu and search results, reset tracking helpers, and
         * re-pack the grid.
         */
        search_results: 'onMenuItemsChanged',
        menuItemChildren: 'onMenuItemsChanged',
        ready: 'onMenuItemsChanged',
    },

    created() {

        this.menuService.addObserver(this, MENU_CHANGED, () => this.getMenuData())

        this.debouncedChangePage = debounce(this.changePage, 1300)
        this.debouncedPackGrid = debounce(this.packGrid, 200)
        window.addEventListener('resize', this.debouncedPackGrid)

        if (this.isSearch && this.searchQuery != null) {
            this.search()
        } else {
            this.getMenuData()
                .then(() => {
                    /**
                     * We need to wait "2 ticks" to make sure grid packing has finished - grid packing waits
                     * "1 tick" to make sure new menu items have been rendered in the DOM
                     */
                    Vue.nextTick(() => {
                        Vue.nextTick(() => {
                            this.restoreState()
                        })
                    });
                })
                .catch(error => {
                    this.error = error
                    console.error(error)
                })
        }

    },

    mounted() {
        this.pageContentEl = this.$el.querySelector('.page__content');
        this.observer = new IntersectionObserver(this.onIntersectionChange, {
            root: this.pageContentEl,
            threshold: 0.25
        });
        this.restoreState();
    },

    beforeRouteLeave(to, from, next) {
        // Make sure debounced function doesn't change route when user is trying to navigate to another page
        if (this.queuedChangePageCall) {
            clearTimeout(this.queuedChangePageCall)
            // Manually track the last search result with GA
            Tracker.track('search', `${this.$router.options.base}/menu`, {
                'query': this.searchQuery,
                'search-ctx': this.searchContext,
            })
        }

        next();
    },

    methods: {

        getMenuData() {
            let path = this.path ? this.path.split('/') : null;

            let menuDataFetchers = [
                (this.isSuggested == false ? this.menuService.browse(path) : Promise.resolve(null)),
                this.menuService.getRecommendedProducts(20)
            ]

            return Promise.all(menuDataFetchers)
                .then(([menuCategory, recommendedProducts]) => {

                    // Some tracking category helpers
                    recommendedProducts.forEach(product => product.isRecommendation = true)

                    const recommendationCategory = {
                        isCategory: true,
                        displayType: CATEGORY_DISPLAY_TYPES.RECOMMENDATION,
                        accentColor: '#16B4AF', // java
                        name: this.$t('menu.recommendedCategory.title'),
                        description: this.$t('menu.recommendedCategory.description'),
                        children: recommendedProducts,
                        isEmpty: recommendedProducts.length == 0,
                    }

                    this.menuItem = this.isSuggested == false ? menuCategory : recommendationCategory
                    this.menuItemChildren = this.menuItem.children

                    if (this.is_menu_root && !recommendationCategory.isEmpty) {
                        // Remove static "most popular" categories
                        this.menuItemChildren = this.menuItemChildren.filter(child => false == (child.isCategory && child.displayType == CATEGORY_DISPLAY_TYPES.MOST_POPULAR))
                        // Add recommendation category into the menu item's children
                        this.menuItemChildren.unshift(recommendationCategory)
                    }

                    // Surprise me tile
                    if (this.is_menu_root) {
                        let insertAt = Math.ceil(this.menuItemChildren.length * 0.5)
                        this.menuItemChildren.splice(insertAt, 0, {
                            surpriseMe: true,
                            name: this.$t('menu.surpriseMe.title'),
                        })
                    }

                    if (this.menuItem.isEmpty && !this.is_menu_root) return this.navigateUp()

                    Tracker.track("viewItemList",this.menuItem)

                })
        },

        /**
         * For long and boring performance reasons we can't just watch a computed `menuItems` property
         * that switches between "normal" menu items and search results, because Vue re-creates all
         * reactive props on the complex "normal" menu items array whenever this value changes.
         */
        onMenuItemsChanged() {
            // Reset page scroll position
            this.pageContentEl.scrollTop = 0

            // Reset tracking related variables
            this.trackedItems = []
            this.observer.disconnect()

            // Augment the PRODUCT menu items with some additional data needed for tracking
            let menuItems = this.isSearch ? this.search_results : this.menuItemChildren
            if (!menuItems) return
            this.productItems = this.findProducts(menuItems, 1)

            this.productItems.forEach((item, idx) => {
                item.list = this.isSearch ? 'Search Results' : (this.is_menu_root ? 'Menu' : this.menuItem.name)
                item.position = idx + 1
                item.trackingCategory = this.isSearch
                    ? 'Search Results'
                    : 'menu/' + (item.isRecommendation ? 'recommendation' : item.idPath)
            })

            Vue.nextTick(() => {
                // Repack the grid (because menu items have changed)
                this.packGrid()

                // Watch for intersection changes on product elements (impression tracking)
                this.trackableProductEls = Array.from(this.$el.querySelectorAll('[data-track-product-impression]'))
                this.trackableProductEls.forEach(el => this.observer.observe(el))
            })
        },

        onIntersectionChange(entries) {
            let itemsToTrack = entries
                .filter(entry => entry.isIntersecting)
                .filter(entry => !this.trackedItems.includes(entry.target))

            if (itemsToTrack.length) {
                let impressions = itemsToTrack.map(entry => {
                    let idx = this.trackableProductEls.indexOf(entry.target)
                    let {id, name, position, trackingCategory, list} = this.productItems[idx]
                    return {id, name, position, trackingCategory, list}
                })

                Tracker.track('productImpressions', impressions)

                this.trackedItems.push(...itemsToTrack.map(entry => entry.target))
            }
        },

        findProducts(children, maxDepth = Number.POSITIVE_INFINITY, depth = 0, results = []) {
            children.forEach(child => {
                if (child.isProduct) {
                    results.push(child)
                } else if (child.children && depth + 1 <= maxDepth) {
                    this.findProducts(child.children, maxDepth, depth + 1, results)
                }
            })
            return results
        },

        restoreState() {
            this.$restoreScrollPosition()
        },

        search() {
            return this.menuService.search(this.searchQuery)
                .then(results => this.search_results = results)
        },

        jumpToMenuItem(menuItem) {
            let match = this.$refs.menuGridItems.find(item => item.data.name == menuItem.name)
            match.$el.scrollIntoView({behavior: PrefersReducedMotion ? 'auto' : 'smooth', block: 'start'})
            this.show_jump_links = false;
        },

        packGrid() {
            if (!this.use_masonry_layout || !this.$refs.menuGrid || !this.$refs.menuGridItems) return
            const grid = this.$refs.menuGrid
            const rowHeight = getStyleValue(grid, 'grid-auto-rows');
            const rowGap = getStyleValue(grid, 'grid-row-gap');
            grid.style.gridAutoRows = 'auto'; // reset `gridAutoRows` before we measure the height of each item in the grid (so that each item is allowed to expand to the height it actually requires)
            grid.style.alignItems = 'self-start';

            this.$refs.menuGridItems.forEach(item => {
                let requiredRows = (item.$el.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap)
                item.$el.style.gridRowEnd = `span ${Math.ceil(requiredRows)}`;
            });

            grid.removeAttribute('style');
        },
    },

    beforeDestroy() {
        if (this.observer) this.observer.disconnect()
        this.menuService.removeObserver(this, MENU_CHANGED)
        window.removeEventListener('resize', this.debouncedPackGrid)
    },
}

function getStyleValue(element, style) {
    return parseInt(window.getComputedStyle(element).getPropertyValue(style))
}