import { Toggleable } from 'nandos-core-ui'
import { provideCommonServices } from '../../../../utils/ordering-provider-utils'
import PrefersReducedMotion from 'nandos-core-ui/src/utils/prefers-reduced-motion'

export default {

  mixins: [Toggleable],

  props: {
    menuService: { type: Object, required: true },
    basketService: { type: Object, required: true },
    globalConfigService: { type: Object, required: true },
    languageService: { type: Object, required: true },
    product: { type: Object /*UserProduct*/, required: true },
  },

  provide: provideCommonServices,

  data() {
    return {
      upsells: null,
    }
  },

  computed: {
    ready() {
      return this.upsells != null
    },

    computedTransition () {
      return PrefersReducedMotion ? 'transition' : 'n-dialog-bottom-transition'
    },

    upsellsPerPage() {
      let preferred = 3
      if(this.$breakpoints.xs)
        preferred = 1
      else if(this.$breakpoints.sm)
        preferred = 2

      return Math.min(preferred, this.upsells.length)
    },
  },

  created() {
    this.basketService.getBasket()
      .then(basket => this.menuService.getProductUpsells(this.product, basket))
      .then(upsells => {
        this.$emit('upsells-retrieved', upsells.length)
        
        if(upsells.length == 0) {
          return this.isActive = false // just close the pop-up
        }

        this.upsells = upsells.slice(0, 10)
        this.upsells.forEach(upsell => upsell.item.trackingCategory = 'product/upsell') // augment with category data for tracking
      })
  }
}