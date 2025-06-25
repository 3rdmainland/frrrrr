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
      formModel: null, // the card that the form is editing
      showRecipientForm: false,
    }
  },

  computed: {
    isEditingExistingRecipient() {
      return this.card.cards.includes(this.formModel)
    }
  },

  watch: {
    'card.cards.length': {
      handler(length) {
        if(length == 0) {
          this.formModel = new GiftCard()
          this.showRecipientForm = true
        }
      },
      immediate: true,
    }
  },

  methods: {
    addRecipient() {
      this.showRecipientForm = true
      this.formModel = new GiftCard()
    },

    editRecipient(card) {
      this.showRecipientForm = true
      this.formModel = card
    },

    removeRecipient(card) {
      this.card.cards.splice( this.card.cards.indexOf(card), 1)
    },

    saveRecipient() {
      if(!this.isEditingExistingRecipient)
        this.card.cards.push( Object.assign({}, this.formModel) )
      this.showRecipientForm = false
    },
  },
}