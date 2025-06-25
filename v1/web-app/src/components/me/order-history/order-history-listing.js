import CustomerService from 'nandos-middleware-api/service/customer/me-service'

/**
 * This component is responsible for displaying past food orders as well as past gift card purchases
 */
export default {

  props: {
    /**
     * Can be used to change where an order list item will link to.
     * For example, to link directly to the order's associated help page, set the suffix to "/help"
     */
    orderLinkSuffix: { type: String, default: '' },
    // Limits the number of displayed order list item
    maxItems: { type: Number }, 
  },

  data () {
    return {
      foodOrders: null,
      giftCardsOrders: null,
    }
  },

  computed: {
    ready() {
      return this.foodOrders != null && this.giftCardsOrders != null
    },

    orders() {
      return [].concat(this.foodOrders, this.giftCardsOrders)
        .sort((a,b) => { // sort by order's placed time
          if(a.orderPlacedTime < b.orderPlacedTime) return 1
          if(a.orderPlacedTime > b.orderPlacedTime) return -1
          return 0
        })
        .slice(0, this.maxItems)
    }
  },

  created() {
    let foodP = CustomerService.getFoodOrders()
    let giftCardsP = process.env.VUE_APP_REGION_SUPPORTS_GIFT_CARDS ? CustomerService.getGiftCardOrders() : Promise.resolve([])
    
    Promise.all([foodP, giftCardsP])
      .then(([foodOrders, giftCardsOrders]) => {
        this.foodOrders = foodOrders
        this.giftCardsOrders = giftCardsOrders
      });
  }
}