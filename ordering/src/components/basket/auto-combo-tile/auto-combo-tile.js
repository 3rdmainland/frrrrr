import { PlaceholderBackground } from 'nandos-core-ui'
import Tracker from '../../../e-commerce-tracker-adapter'

export default {
  mixins: [PlaceholderBackground],

  props: {
    autoComboItem: { type: Object, required: true},
  },

  computed: {
    // Used to seed Placeholder Background mixin
    seed() {
      return this.autoComboItem.comboProduct.id
        .split('')
        .reduce((acc, next) => acc += next.charCodeAt(0), 0)
    },
  },

  methods: {
    onClick() {
      Tracker.track('productClick', this.autoComboItem.userProduct, this.autoComboItem.trackingCategory)
    }
  }
}