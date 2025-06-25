export default {

  props: {
    value: { type: Object },
    cards: { type: Array, default: [] },
    selectable: { type: Boolean, default: true }, // when true list displays radio controls next to each card indicating which card is selected
    removable: { type: Boolean, default: true }, // when true list display delete icons next to each card
    selectedClasses: { type: String }, // when true list display delete icons next to each card
  },

  data() {
    return {
      selected_card: this.value,
      BASE_URL: process.env.BASE_URL,
    }
  },

  watch: {
    selected_card() {
      this.$emit('input', this.selected_card)
    },

    value() {
      this.selected_card = this.value
    },
  },
}