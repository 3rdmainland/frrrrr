import GlobalConfigService from 'nandos-middleware-api/service/global-config-service'
import CustomerCreditCard from 'nandos-middleware-api/model/customer-credit-card'

export default {

  props: {
    value: { type: Object, required: true }
  },

  data() {
    return {
      accepted_cards: null,
      card_requires_name: null,
      new_credit_card: this.value,
      months: Array.from(new Array(12),(v,idx) => this.$options.filters.padStart(idx + 1)),
      years: Array.from(new Array(12),(v,idx) => String(new Date().getFullYear() + idx)),
      BASE_URL: process.env.BASE_URL,
    }
  },

  watch: {
    new_credit_card: {
      handler() {
        this.$emit('input', this.new_credit_card)
      },
      deep: true
    },
  },

  computed: {
    ready() {
      return this.accepted_cards != null
    },

    creditCardYearRegex () {
      let [millennia, century, decade, year] = new Date()
        .getFullYear()
        .toString()
        .split('')
        .map(s => parseInt(s))

      // If the user has selected a month that is less than the current month in the current year, increase min year 
      if(this.new_credit_card.expiryMonth && parseInt(this.new_credit_card.expiryMonth) < (new Date().getMonth() + 1)) {
        year++
        if(year >= 10) {
          year = 0;
          decade++
        }
      }
        
      return `${millennia}${century}((${decade}[${year}-9])|([${decade + 1}-9][0-9]))`
    },
  },

  created() {
    GlobalConfigService.getConfigs()
      .then(config => {
        this.accepted_cards = config.onlinePaymentRequirements.acceptedCardTypes.map(type => type.replace(/_/g, '-').toLowerCase())
        this.card_requires_name = config.onlinePaymentRequirements.cardHolderNameRequired
      })
  },
}