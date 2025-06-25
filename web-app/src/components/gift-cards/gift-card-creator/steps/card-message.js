import logger from 'nandos-dev-logger'
import GiftCardBasketService from 'nandos-middleware-api/service/gift-card-basket-service'
import ProfanityService from 'nandos-middleware-api/service/profanity-service'

export default {

  props: {
    card: { type: Object, required: true },
    presets: { type: Object, required: true },
    isNewCard: { type: Boolean, required: true },
  },

  data() {
    return {
      selected_preset: null,
      input_message: null,
      messageHasBannedWord: false,
    }
  },

  computed: {
    selectionIsValid() {
      return this.card.message != null && this.card.message != '' && this.messageHasBannedWord === false
    }
  },

  watch: {
    input_message(val) {
      if(val == null) return
      this.testForProfanities()
      this.selected_preset = null // clear selected preset (achieves our bizarre UX)
      ProfanityService.sanitize(val)
        .then(sanitised => this.card.message = sanitised)
        .catch(e => this.card.message = val) // just allow the user to type whatever they want if we don't get a profanities list
    },

    selected_preset(preset) {
      if(preset == null) return
      this.card.message = preset
      this.input_message = null // clear custom value (achieves our bizarre UX)
    },
  },

  created() {
    // Restore selected preset (if any)
    if(this.card.message) {
      this.input_message = this.card.message
    }
  },

  methods: {
    testForProfanities() {
      ProfanityService.detect(this.input_message)
        .then(result => this.messageHasBannedWord = result)
        .catch(e => logger.warn('Nandos Web', e))
    }
  },
}