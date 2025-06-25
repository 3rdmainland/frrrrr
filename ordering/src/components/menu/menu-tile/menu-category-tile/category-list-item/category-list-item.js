import logger from 'nandos-dev-logger'
import MenuProductUtils from '../../../../../mixins/menu-product-display-utils.js'
import { getMenuItemUrl } from '../../../menu-tile/menu-tile.js'
import { isPreviewKey } from '../../../../../utils/ordering-provider-utils'

export default {
  
  inject: {
    preview: isPreviewKey,
  },

  mixins: [MenuProductUtils],
  
  props: {
    data: { type: Object /*MenuDisplayItem*/, required: true },
    hideDescription: { type: Boolean },
  },

  computed: {
    itemDescription() {
      return this.data.isProduct ? this.productDescription : this.data.description
    },

    itemPrice() {
      return this.data.isProduct ? this.productPrice : this.data.minPrice
    },

    itemUrl() {
      return getMenuItemUrl(this.data, this.$route, this.preview) 
    }
  },
}