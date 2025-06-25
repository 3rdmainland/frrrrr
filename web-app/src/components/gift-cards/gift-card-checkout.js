import GiftCardBasketService from 'nandos-middleware-api/service/gift-card-basket-service'
import Tracker from 'nandos-tracking'

export default {

  data () {
    return {
      basket: null,
      paymentService: GiftCardBasketService,
      checkoutInProgress: false,
      loading: false,
      isFinalStep: true,
      somePaymentMethodsAvailable: false,
    }
  },

  computed: {
    ready() {
      return this.basket != null
    },

    show_footer() {
      return this.$breakpoints.smDown && !this.checkoutInProgress
    },
  },

  created() {
    Tracker.track('checkout', 2)

    GiftCardBasketService.getBasket()
      .then(basket => this.basket = basket)
  },

  methods: {

    onProceedBtnClick() {
      this.$refs.paymentProcessor.$el.scrollIntoView(true)
      this.$refs.paymentProcessor.proceed()
    },

    onPayBtnClick() {
      if(this.$refs.paymentProcessor.checkoutInProgress == false)   
        this.$refs.paymentProcessor.pay()
    },

    onPaymentCancelled(error) {
      this.$router.push({name: 'gift-card-basket'})
    },

    onSuccessfulPayment(transaction) {
      GiftCardBasketService.paymentCompleted(transaction) // let the service layer know the basket was paid for
      
      // Payment option tracking
      transaction.components.forEach(t => Tracker.track('paymentOption', t.type, t.amount, transaction.components.length > 1))

      // Purchase tracking
      Tracker.track('purchase', transaction.orderId, this.basket, "Nando's")

      this.$router.push(`/gift-cards/basket/checkout/success/${transaction.orderId}`)
    }
  }
}