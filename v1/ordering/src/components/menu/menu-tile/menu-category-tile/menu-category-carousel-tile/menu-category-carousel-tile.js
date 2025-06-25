import Vue from 'vue'
import { PlaceholderBackground } from 'nandos-core-ui'
import { languageServiceKey, isPreviewKey } from '../../../../../utils/ordering-provider-utils'

export default {
  
  inject: {
    languageService: languageServiceKey,
    preview: isPreviewKey,
  },

  mixins: [PlaceholderBackground],
  
  props: {
    data: { type: Object /*MenuDisplayItem*/, required: true },
  },

  data() {
    return {
      activeVideoTile: null,
    }
  },

  computed: {
    classes() {
      return {
        'menu-tile menu-tile--category menu-tile--category-carousel-tile': true,
        'menu-tile--featured': this.data.isFeatured,
        'menu-tile--suppress-child-accent-colors': this.data.suppressChildAccentColors,
        'menu-tile--with-accent-color': this.data.accentColor != null,
      }
    }
  },

  methods: {

    onSlideVideoIsPlaying(tile) {
      this.activeVideoTile = tile
    },

    onCarouselPageChanged() {
      if(this.activeVideoTile) {
        this.activeVideoTile.pauseVideo()
        this.activeVideoTile = null
      }
    },
  }
}