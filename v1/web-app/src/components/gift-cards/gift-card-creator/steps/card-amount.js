import Vue from 'vue'

export default {

  props: {
    card: { type: Object, required: true },
    presets: { type: Object, required: true },
    minPrice: { type: Number },
    maxPrice: { type: Number },
  },

  data() {
    return {
      selected_preset: null,
      input_price: null,
    }
  },

  computed: {
    prices() {
      return this.presets.prices
    },

    selectionIsValid() {
      return this.card.price != null && this.card.price != ''
    }
  },

  watch: {
    input_price(val) {
      if(val == null) return
      this.card.price = val * 100 // transform rand values to cents
      this.selected_preset = null // clear selected preset (achieves our bizarre UX)
    },

    selected_preset(preset) {
      if(preset == null) return
      this.card.price = preset // transform rand values to cents
      this.input_price = null // clear custom value (achieves our bizarre UX)
    },
  },

  created() {
    // Restore selected preset (if any)
    if(this.card.price) {
      this.input_price = this.card.price / 100
    }
  },
}