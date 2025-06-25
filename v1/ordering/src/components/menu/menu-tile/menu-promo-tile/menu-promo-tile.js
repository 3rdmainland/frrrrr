import { PlaceholderBackground } from 'nandos-core-ui'
import { isPreviewKey } from '../../../../utils/ordering-provider-utils'

export default {
  
  inject: {
    preview: isPreviewKey,
  },

  mixins: [PlaceholderBackground],

  props: {
    data: { type: Object, required: true },
  },

  data() {
    return {
      isPlaying: false,
    }
  },

  computed: {
    promotion() {
      return this.data.promotion
    },

    classes() {
      return {
        'menu-tile menu-tile--promo-tile': true,
        'menu-tile--promo-tile--video-is-playing': this.isPlaying,
        'menu-tile--with-accent-color': this.data.accentColor != null,
      }
    },
  },

  methods: {
    playVideo() {
      this.isPlaying = true
      this.$refs.youtubePlayer.player.playVideo()
      this.$emit('video-is-playing', this)
    },

    pauseVideo() {
      this.isPlaying = false
      this.$refs.youtubePlayer.player.pauseVideo()
    },
  },
}

