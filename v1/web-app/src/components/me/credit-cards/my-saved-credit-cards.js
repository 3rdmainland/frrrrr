import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import GlobalConfigService from 'nandos-middleware-api/service/global-config-service'

export default {

  data () {
    return {
      cards: null,
      show_confirm_delete_dialog: false,
      card_pending_delete: null,
      can_create_card: false,
    }
  },

  computed: {
    ready() {
      return this.cards != null;
    }
  },

  created() {
    GlobalConfigService.getConfigs()
      .then(config => this.can_create_card = config.onlinePaymentRequirements.allowCardStorageFlow)

    this.getCards();
  },

  watch: {
    card_pending_delete(newVal) {
      if(newVal != null) this.show_confirm_delete_dialog = true
    },

    show_confirm_delete_dialog(newVal) {
      if(newVal == false) this.card_pending_delete = null
    }
  },

  methods: {
    getCards() {
      CustomerService.getCreditCards()
        .then(cards => this.cards = cards)
    },

    startCardDelete(card) {
      this.card_pending_delete = card
    },

    abortCardDelete() {
      this.card_pending_delete = null
      this.show_confirm_delete_dialog = false
    },

    deleteCard() {
      CustomerService.deleteCreditCard(this.card_pending_delete.id)
        .then(() => {
          this.show_confirm_delete_dialog = false
          this.$toaster.show(this.$t('profile.creditCards.listing.deleted'))
        })
        .then(this.getCards)
    }
  }
}