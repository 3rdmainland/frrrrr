import {getCategoryUrl} from '../menu-tile/menu-tile.js'
import {isPreviewKey} from '../../../utils/ordering-provider-utils'
import {ScrollSpy} from "nandos-core-ui";

export default {

    inject: {
        preview: isPreviewKey,
    },

    props: {
        quickLinks: Array, // [MenuDisplayItem]
    },

    data() {
        return {
            getCategoryUrl,
            scrollSpy: null,
            hasItemsLeft: false,
            hasItemsRight: false,
        }
    },


    mounted() {
        this.centerLink(this.$el.querySelector('.is-active'), 'auto')

        this.scrollSpy = new ScrollSpy(this.$el, scrollX => this.calculateContainerButtonPositions(scrollX, this.$el), true)

        this.calculateContainerButtonPositions(0, this.$el)

    },
    beforeDestroy() {
        this.scrollSpy && this.scrollSpy.destroy()
    },

    watch: {
        '$route.path'() {
            setTimeout(() => this.centerLink(this.$el.querySelector('.is-active'), 'smooth'), 0)
        },
    },

    methods: {

        calculateContainerButtonPositions(scrollX, el) {
            const maxScroll = el.scrollWidth - el.clientWidth

            if (el.scrollWidth > el.clientWidth) {
                this.hasItemsLeft = scrollX > 0
                this.hasItemsRight = scrollX <= maxScroll
            } else {
                this.hasItemsLeft = false
                this.hasItemsRight = false
            }

        },

        centerLink(el, behavior = 'smooth') {
            if (!el) return
            el.scrollIntoView({behavior, inline: 'center'})
        },
        scrollDirection(event, positive = true) {
            const maxScroll = positive ? this.$el.scrollWidth - this.$el.clientWidth : 0
            const step = (this.$el.clientWidth / 2)

            let scrollDistance = this.$el.scrollLeft; // scroll 50% forward

            scrollDistance = positive ? scrollDistance + step : scrollDistance - step

            const scrollMaxBreached = positive ? scrollDistance > maxScroll : scrollDistance < maxScroll
            if (scrollMaxBreached) {
                scrollDistance = maxScroll
            }
            this.$refs.scrollContainer.scrollTo({left: scrollDistance, behavior: "smooth"})
        },

    },
}