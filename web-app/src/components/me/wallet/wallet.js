import { ACTIVE, REDEEMED } from 'nandos-middleware-api/model/gift-card'
import CustomerService from 'nandos-middleware-api/service/customer/me-service'

export default {

  data () {
    return {
      ACTIVE,
      REDEEMED,
      user: null,
      wallet: null,
      cards: null,
      currentPage: 0,
      totalPages: 0,
      selectedCard: null,
      showQRModal: false,
      filters: {
        status: ACTIVE,
      },
      API: process.env.VUE_APP_API,
    }
  },

  computed: {
    ready() {
      return this.user && this.wallet && this.cards
    }
  },

  watch: {
    filters: {
      handler() {
        this.currentPage = 0
        this.getGiftCards()
      },
      deep: true,
    },

    currentPage() {
      this.getGiftCards()
    }
  },

  created() {
    Promise.all([CustomerService.getMe(), CustomerService.getWallet(), this.getGiftCards()])
      .then(([user, wallet]) => {
        this.user = user
        this.wallet = wallet
      })
  },

  methods: {
    onCardClicked(card) {
      if(card.status != ACTIVE) return
        
      this.selectedCard = card
      this.showQRModal = true;
    },

    getGiftCards() {
      return CustomerService.getGiftCards(this.filters, this.currentPage)
        .then(cards => {
          this.cards = cards.giftcards
          this.totalPages = cards.totalPages
          this.currentPage = cards.pageNumber

          if(this.$refs.giftCardListing)
            this.$refs.giftCardListing.scrollIntoView({behavior: 'smooth', block: 'start'})
        })
    },
  },
}