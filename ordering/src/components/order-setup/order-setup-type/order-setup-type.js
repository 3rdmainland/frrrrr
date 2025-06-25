import logger from 'nandos-dev-logger'
import ContextualOrderClasses from '../../../utils/contextual-order-classes'
import { ORDER_TYPES } from 'nandos-middleware-api/model/food-basket'

export default {

  props: {
    minimumDeliveryAmount: { type: Number },
    orderType: { type: String },
    eatInEnabled: { type: Boolean },
    kerbsideOnlyCollection: { type: Boolean },
    kerbsideCollectionEnabled: { type: Boolean },
  },

  data() {
    return {
      getContextualOrderClasses: ContextualOrderClasses,
      ORDER_TYPES,
      WARN_ABOUT_DELIVERY_PRICING: process.env.VUE_APP_WARN_ABOUT_DELIVERY_PRICING,
    }
  },

  methods: {
    onOrderTypeTileClicked(type) {
      this.$emit('update:orderType', type)

      let next = { name:'', query: this.$route.query }

      switch(type) {
        case ORDER_TYPES.COLLECTION:
          next.name = 'order-setup-final'; break;
        case ORDER_TYPES.DELIVERY:
          next.name = 'order-setup-address'; break;
        case ORDER_TYPES.EAT_IN:
          next.name = 'order-setup-eat-in-landing'; break;
        default:
          return logger.warn('Nandos Ordering', 'Unexpected call to: goToNextStep')
      }

      this.$router.push(next)
    },
  },
}