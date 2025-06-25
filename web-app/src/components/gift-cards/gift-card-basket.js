import GiftCardBasketService from 'nandos-middleware-api/service/gift-card-basket-service'
import Tracker from 'nandos-tracking'
import headerImageCollection from './gift-card-header-image-collection'

export default {

  data() {
    return {
      headerImageCollection,
      basket: null,
      card_pending_delete: null,
      CUSTOMER_CARE_EMAIL: process.env.VUE_APP_CUSTOMER_CARE_EMAIL,
    }
  },

  computed: {
    ready() {
      return this.basket != null
    },

    showFooter() {
      return this.ready && !this.basket.isEmpty
    },

    canPlaceOrder() {
      return this.ready && !this.basket.exceedsMaximumOrderValue && !this.basket.exceedsDailyPurchaseLimit
    },
  },

  created() {
    GiftCardBasketService.getBasket()
      .then(basket => this.basket = basket)
      .then(basket => { // Analytics tracking - checkout funnel step 1
        if(!basket.isEmpty) Tracker.track('checkout', 1, basket)
      })
  },

  methods: {
    deleteCard(card) {
      this.card_pending_delete = card
      GiftCardBasketService.removeCard(card)
        .then(basket => {
          this.basket = basket
          this.card_pending_delete = null
          this.$toaster.show(this.$t('giftCard.basket.itemRemoved'), {parent: this})
          Tracker.track('removeFromCart', card)
        })
    }
  },
}