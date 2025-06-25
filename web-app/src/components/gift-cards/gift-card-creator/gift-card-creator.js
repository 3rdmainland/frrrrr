import Vue from 'vue'
import GiftCardBasketService from 'nandos-middleware-api/service/gift-card-basket-service'
import GiftCardBasketItem from 'nandos-middleware-api/model/gift-card-basket-item'
import { ViewStateService } from 'nandos-core-ui'
import Tracker from 'nandos-tracking'
import GiftCardRenderer from './gift-card-renderer'

export default {

  props: {
    cardId: { type: String, required: true },
  },

  components: {
    GiftCardRenderer,
  },

  data() {
    return {
      steps: ['design', 'amount', 'message', 'recipients', 'details'],
      card: null,
      presets: null,
      basket: null,
      view_state: ViewStateService,
      loading: false,
      error: null,
      confirmRecipientsBeforeSave: false,
      showConfirmationDialog: false,
    }
  },

  computed: {

    ready() {
      return this.card != null && this.presets != null && this.basket != null
    },

    step: {
      get() {
        return this.steps.indexOf( this.$route.path.split('/').pop() ) + 1
      },

      set(val) {
        let path = `/gift-cards/basket/${this.cardId}/${this.steps.slice(0, val).join('/')}`
        if(path != this.$route.path) {
          this.$router.push(path)
        }
      }
    },

    editingExistingCard() {
      return this.cardId != 'new'
    },

    isNewCard() {
      return !this.editingExistingCard
    },

    stepTitle() {
      let key = this.steps[this.step-1]
      return this.$t(`giftCard.creation.steps.${key}.title`)
    },

    /**
     * Steps that the user can't navigate to
     */
    disabledSteps() {
      if(!this.card.srcImageUrl) return [2, 3, 4, 5]
      if(!this.card.price) return [3, 4, 5]
      if(!this.card.message) return [4, 5]
      if(!this.card.cards.length > 0 ) return [5]
    },

    cardPreviewTextColor() {
      let light = '#fff'
      let dark = '#000'
      if(this.card.srcImageUrl) {
        let matched = this.presets.designs.find(preset => preset.image.path == this.card.srcImageUrl)
        if(matched) return matched.theme == 'LIGHT' ? light : dark
      }
      return dark // no design chosen yet, default to dark
    },

    cardPreviewTextGravity() {
      if(this.card.srcImageUrl) {
        let matched = this.presets.designs.find(preset => preset.image.path == this.card.srcImageUrl)
        if(matched) return matched.gravity
      }
    },

    pageTransition() {
      switch(this.view_state.lastNavigationDirection) {
        case 'up': return 'fade-left-to-right'
        case 'down': return 'fade-right-to-left'
      }
    },
  },

  watch: {
    'card.cards': {
      deep:true,
      handler(newval, oldval) {
        // If the card recipients list is modified, make sure to show a recipient details confirmation dialog before we save the card
        if(oldval != null) this.confirmRecipientsBeforeSave = true
      }
    }
  },

  created() {

    // Reset URL - If we are creating a new card, user must start from step 1
    if(this.isNewCard) this.step = 1

    let cardResolver = this.isNewCard
      ? Promise.resolve( new GiftCardBasketItem() ) // Creating a new card
      : GiftCardBasketService.getBasketItem(this.cardId) // Editing an existing card

    Promise.all([cardResolver, GiftCardBasketService.getGiftCardPresets(), GiftCardBasketService.getBasket()])
      .then(([card, presets, basket]) => {
        this.card = card
        this.presets = presets
        this.basket = basket
      })

    cardResolver.catch(error => {
      if(error.code == 'NOT_FOUND') this.$router.push('/gift-cards/basket')
    })
  },

  methods: {
    onCardCreationComplete(e) {
      this.confirmRecipientsBeforeSave ? this.showConfirmationDialog = true : this.saveCard()
    },

    saveCard() {
      // Write canvas image data onto card
      this.card.renderedImageData = this.$refs.giftCardRenderer.getImage()

      let saveCard = this.isNewCard
        ? GiftCardBasketService.addCard(this.card)
        : GiftCardBasketService.updateCard(this.card)

      this.loading = true

      saveCard
        .then(() => {
          if(this.isNewCard) {
            Tracker.track('addToCart', this.card)
          }
          this.$router.push('/gift-cards/basket')
        })
        .catch(e => {
          this.error = e
          if(this.error.meta) {
            this.error.meta.forEach((issue, idx) => issue.relatedCard = this.card.cards[idx])
          }
        })
        .then(() => this.loading = false)
    }
  },
}