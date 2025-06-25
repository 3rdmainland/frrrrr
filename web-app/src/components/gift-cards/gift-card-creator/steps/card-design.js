import GiftCardBasketService from 'nandos-middleware-api/service/gift-card-basket-service'
import LanguageService from 'nandos-middleware-api/service/my-language-service'

export default {

  props: {
    card: { type: Object, required: true },
    presets: { type: Object, required: true },
    isNewCard: { type: Boolean, required: true },
  },

  data() {
    return {
      selected_design: null,
      languageService: LanguageService,
    }
  },

  computed: {
    selectionIsValid() {
      return this.card.srcImageUrl != null
    },
  },

  watch: {
    selected_design(preset) {
      this.card.srcImageUrl = preset.image.path
    },
  },

  mounted() {
    // Restore design preset
    let matched = this.presets.designs.find(preset => preset.image.path == this.card.srcImageUrl)
    if(matched) {
      this.selected_design = matched
      // show the appropriate page of slides in the carousel
      this.$refs.carousel && this.$refs.carousel.goTo(this.presets.designs.indexOf(matched), true)
    }
    else {
      this.selected_design = this.presets.designs[0]
    }
  },

  methods: {
    onCarouselPageChanged(pageIdx) {
      this.selected_design = this.presets.designs[pageIdx]
    },
  },
}