import MenuProductUtils from '../../../../mixins/menu-product-display-utils.js'
import { PlaceholderBackground } from 'nandos-core-ui'
import { isPreviewKey } from '../../../../utils/ordering-provider-utils'

export default {
  
  inject: {
    preview: isPreviewKey,
  },

  mixins: [MenuProductUtils, PlaceholderBackground],

  props: {
    hideDescription: { type: Boolean },
    expansiveLayout: { type: Boolean }, // turn on big heading + triangle decorators
    row: { type: Boolean, default: true },
  },

  computed: {
    classes() {
      return {
        'tile layout child-flex menu-tile menu-tile--product-tile': true,
        'menu-tile--with-accent-color': this.expansiveLayout && this.data.accentColor != null,
        'menu-tile--product-tile--expansive-layout': this.expansiveLayout,
        'row wrap': this.row,
        'column': !this.row,
      }
    },

    // Used to seed Placeholder Background mixin
    seed() {
      let product = this.data.product;
      return product.getIdPath()
        .split('')
        .reduce((acc, next) => acc += next.charCodeAt(0), 0)
    },
  },
}