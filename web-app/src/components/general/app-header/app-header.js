import { requests_in_flight } from 'nandos-middleware-api/http'
import CustomerService, { CUSTOMER_UPDATED } from 'nandos-middleware-api/service/customer/me-service'
import { RouterUtils, ScrollSpy } from 'nandos-core-ui'
import { toolbarActionItems } from '@/navigation'
import LanguageService from 'nandos-middleware-api/service/my-language-service'
import BasketService from 'nandos-middleware-api/service/basket/my-basket-service'

export default {

  mixins: [RouterUtils],

  props: {
    title: { type: String, default: '' },
    backTitle: { type: String, default: '' },
    truncateTitle: { type: Boolean, default: true },
    white: { type: Boolean, default: false },
    transparent: { type: Boolean, default: false },
    forceHamburger: { type: Boolean, default: false },

    // Fade the app header's background color in as a page is scrolled
    scrollSpyTarget: { type: Object }, // a Vue component reference
    fadeTo: { type: Array, default: () => [245, 245, 245]  }, // the color (rgb) to fade to
  },

  data() {
    return {
      basketService: BasketService,
      user: null,
      nav_open: false,
      requests_in_flight: requests_in_flight,
      toolbarActions: null,
      languageService: LanguageService,
      scrollSpy: null,
    }
  },

  computed: {

    classes() {
      return {
        'app-header': true,
        'app-header--white': this.white,
        'app-header--transparent': this.transparent,
      }
    },

    at_root() {
      return this.$route.path.split('/').splice(1).length === 1
    },

    loadingData() {
      return this.requests_in_flight.length > 0;
    },

    desktopLayout() {
      return this.$breakpoints.mdUp
    },

    showBrochureToolbarActions() {
      return this.$isBrowserApp && this.desktopLayout
    },

    signedInUser() {
      return this.user && !this.user.anonymous
    },
  },

  watch: {
    'languageService.language': 'getToolbarActions',

    scrollSpyTarget (newVal) {
      if(newVal) this.createScrollSpy()
      else this.destroyScrollSpy()
    },
  },

  created() {
    this.getUser()
    this.getToolbarActions()
    CustomerService.addObserver(this, CUSTOMER_UPDATED, () => this.getUser())
  },

  methods: {
    getUser() {
      CustomerService.getMe()
        .then(me => this.user = me)
    },

    getToolbarActions() {
      return toolbarActionItems()
        .then(toolbarActions => this.toolbarActions = toolbarActions)
    },

    createScrollSpy() {
      // find the innermost scroll container
      let parentScrollContainer = Array.from(this.scrollSpyTarget.$el.querySelectorAll('.page__content')).pop()
      let fadeOutBy = this.$el.offsetHeight
      let color = this.fadeTo.join(',')
      this.scrollSpy = new ScrollSpy(parentScrollContainer, scrollY => {
        let delta = Math.max(Math.min(scrollY/fadeOutBy, 1), 0)
        this.$el.style.backgroundColor = `rgba(${color}, ${delta})`
      })
    },

    destroyScrollSpy() {
      this.scrollSpy && this.scrollSpy.destroy()
      if(this.$el) this.$el.style.backgroundColor = ''
    },
  },

  beforeDestroy() {
    CustomerService.removeObserver(this, CUSTOMER_UPDATED)
    this.destroyScrollSpy()
  },
}