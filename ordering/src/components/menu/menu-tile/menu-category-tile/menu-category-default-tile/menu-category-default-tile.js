import { PlaceholderBackground } from 'nandos-core-ui'
import { getMenuItemUrl } from '../../menu-tile.js'
import { CATEGORY_DISPLAY_TYPES } from 'nandos-middleware-api/model/menu-category'
import { isPreviewKey } from '../../../../../utils/ordering-provider-utils'

export default {
  
  inject: {
    preview: isPreviewKey,
  },

  mixins: [PlaceholderBackground],

  props: {
    data: { type: Object /*MenuDisplayItem*/, required: true },
    showChildren: { type: Boolean, default: true },
    redirect: String,
  },

  computed: {

    classes() {
      return {
        'menu-tile menu-tile--category': true,
        'menu-tile--featured': this.data.isFeatured,
        'menu-tile--suppress-child-accent-colors': this.data.suppressChildAccentColors,
        'menu-tile--with-accent-color': this.useAccentColor,
      }
    },

    categoryRoute() {
      let redirect = this.redirect ? {redirect: this.redirect, jump: true} : undefined
      return getMenuItemUrl(this.data, this.$route, this.preview, redirect)
    },
    
    useAccentColor() {// we don't display accent colors when showing children for some crazy reason
      return this.renderChildren == false &&  this.data.accentColor != null
    },
    
    renderChildren() {
      return this.showChildren == true && this.data.displayType != CATEGORY_DISPLAY_TYPES.MUTED_CHILDREN
    },
  },
}