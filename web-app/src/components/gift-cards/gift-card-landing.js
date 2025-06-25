import GiftCardBasketService from 'nandos-middleware-api/service/gift-card-basket-service'
import headerImageCollection from './gift-card-header-image-collection'


export default {

  data() {
    return {
      headerImageCollection,
      purchaseCardDestinationUrl: null
    }
  },

  created() {
    this.purchaseCardDestinationUrl = this.$route.path + '/basket'
    // If user's basket is empty, modify the "purchase card" button to take the user directly to the "create new card" view
    GiftCardBasketService.getBasket()
      .then(basket => {
        if(basket.isEmpty) this.purchaseCardDestinationUrl += '/new/design'
      })
  },
}