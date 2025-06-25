import { CATEGORY_DISPLAY_TYPES } from 'nandos-middleware-api/model/menu-category'
import { isPreviewKey } from '../../../../../utils/ordering-provider-utils'

export default {
  
  inject: {
    preview: isPreviewKey,
  },
  
  props: {
    data: { type: Object, required: true },
  },

  computed:{
    isSuggested() {
      return this.data.displayType == CATEGORY_DISPLAY_TYPES.RECOMMENDATION
    },

    classes() {
      return {
        'menu-tile menu-tile--category menu-tile--category-recommendation-tile pattern-bg pattern-bg--default': true,
        'menu-tile--featured': this.data.isFeatured,
        'menu-tile--suppress-child-accent-colors': this.data.suppressChildAccentColors,
        'menu-tile--with-accent-color': this.data.accentColor != null,
      }
    },

    numItemsToDisplay() {
      return this.isSuggested
        ? this.$breakpoints.mdUp ? 6 : 4
        : Number.POSITIVE_INFINITY
    },

    hasAdditionalItems() {
      return this.isSuggested && this.data.children.length > this.numItemsToDisplay
    },
  },
}