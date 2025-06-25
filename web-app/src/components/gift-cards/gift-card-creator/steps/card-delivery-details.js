import ProfanityService from 'nandos-middleware-api/service/profanity-service'
import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import GiftCard from 'nandos-middleware-api/model/gift-card'

export default {

  props: {
    card: { type: Object, required: true },
    presets: { type: Object, required: true },
    isNewCard: { type: Boolean, required: true },
    loading: { type: Boolean, required: true },
  },

  data() {
    return {
      showDateScheduler: false,
      selectedDate: null,
    }
  },

  computed: {
    avilable_send_dates() {
      let today = new Date()
      let dates = []
      for (var i = 0; i < 14; i++) {
        let date = new Date()
        date.setHours(8) && date.setMinutes(0) && date.setSeconds(0) && date.setMilliseconds(0)
        date.setDate(today.getDate() + i + 1)
        dates.push(date)
      }
      return dates
    },
  },

  watch: {
    selectedDate() {
      this.card.scheduled = this.selectedDate
    },

    showDateScheduler(val) {
      if(val)
        this.card.scheduled = this.selectedDate
      else
        this.card.scheduled = null
    },
  },

  created() {
    this.selectedDate = this.card.scheduled || null
    this.showDateScheduler = this.selectedDate != null
  },

  mounted() {
    if(!this.card.fromName) {
      CustomerService.getMe()
        .then(user => this.card.fromName = user.name)
    }
  },
}