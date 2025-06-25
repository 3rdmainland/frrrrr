import { ORDER_TYPES } from 'nandos-middleware-api/model/food-basket'
import ContextualOrderClasses from '../../utils/contextual-order-classes'

export default {

  props: {
    orderType: { type: String, reuired: true },
    orderImagery: { type: Boolean },
  },

  data() {
    return {
      ORDER_TYPES,
    }
  },

  computed: {
  	contextualOrderTypeClasses() {
      return {
        'white--text': true,
        [ContextualOrderClasses(this.orderType)]: true,
      }
  	},
  },
}