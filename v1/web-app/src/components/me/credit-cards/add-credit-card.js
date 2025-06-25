import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import CustomerCreditCard from 'nandos-middleware-api/model/customer-credit-card'
import Tracker from 'nandos-tracking'

export default {

  data () {
    return {
      new_credit_card: new CustomerCreditCard(),
      loading: false,
    }
  },

  methods: {
    onSubmit() {
      this.loading = true
      CustomerService.addCreditCard(this.new_credit_card)
        .then(() => this.$toaster.show( this.$t('profile.creditCards.create.created') ))
        .then(() => Tracker.track('addPaymentInfo'))
        .then(() => this.$router.push('/me/credit-cards'))
        .then(() => this.loading = false)
    },
  }
}