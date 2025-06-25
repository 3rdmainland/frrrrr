import Vue from 'vue'
import {debounce, addOnceEventListener, AppDimensions} from 'nandos-core-ui'
import PrefersReducedMotion from 'nandos-core-ui/src/utils/prefers-reduced-motion'

export default {

    mixins: [AppDimensions],

    props: {
        userProduct: {type: Object, required: true},
        useSplitLayout: {type: Boolean},
        hideDone: {type: Boolean},
        hideCloseBtn: {type: Boolean}
    },

    data() {
        return {
            flavour1: null,
            flavour2: null,
            halfAndHalfMode: false,
            // dimensions required to draw half-&-half curve
            viewport: {width: window.innerWidth, height: window.innerHeight},
            chilli: {x: 0, y: 0, width: 0, height: 0},
            chilliStem: {x: 0, y: 0},
            chilliApex: {x: 0, y: 0},
            debugSVG: false,//process.env.NODE_ENV == 'development', // show debug markers
            pageIntroAnimationComplete: false,
            silentFlavourUpdate: true,
        }
    },

    computed: {

        classes() {
            return {
                'product-configurator-flavour-selection': true,
                ['flavour-1-' + this.flavour1]: this.flavour1 != null,
                ['flavour-2-' + this.flavour2]: this.flavour2 != null,
            }
        },

        selectionIsValid() {
            if (this.halfAndHalfMode) return this.flavour1 != null && this.flavour2 != null
            else return this.flavour1 != null
        },

        productFlavours() {
            return this.userProduct.getDisplayRelatedProducts()
        },

        flavour1FillClass() {
            if (this.flavour1)
                return `${this.flavour1}--fill`
        },

        flavour2FillClass() {
            if (this.flavour2)
                return `${this.flavour2}--fill`
        },

        availableFlavourNames() {
            return this.productFlavours
                .filter(p => p.isAvailable()) // filter out unavailable flavours
                .map(p => p.getNormalisedFlavourCode())
        },

        /**
         * Returns a Boolean indicating if the product allows for half-&-half flavour configuration
         */
        productHasNoSauceOption() {
            return this.availableFlavourNames.includes('no-sauce')
        },

        /**
         * Returns half-&-half Flavour option from a product's flavour choices
         */
        halfAndHalfFlavourContainer() {
            return this.productFlavours.find(up => up.isHalfAndHalfContainer())
        },

        /**
         * Returns a Boolean indicating if the product allows for half-&-half flavour configuration
         */
        productHasHalfAndHalfOption() {
            return this.halfAndHalfFlavourContainer != null
        },

        /**
         * Returns the corresponding half-&-half flavour option that matches our `flavour1` value
         */
        matchingHalfAndHalfProductForFlavuor1() {
            return this.halfAndHalfFlavourContainer
                .getDisplayRelatedProducts()
                .find(hAHflavour => hAHflavour.getNormalisedFlavourCode() == this.flavour1)
        },

        /**
         * Returns the corresponding half-&-half flavour option that matches our `flavour2` value
         */
        matchingHalfAndHalfProductForFlavour2() {
            return this.matchingHalfAndHalfProductForFlavuor1
                .getDisplayRelatedProducts()
                .find(hAHflavour => hAHflavour.getNormalisedFlavourCode() == this.flavour2)
        },

        curveData() {
            let viewport = this.viewport
            let chilli = this.chilli
            let chilliStem = this.chilliStem
            let chilliApex = this.chilliApex

            /*
              [
                [ [x,y], [x,y], [x,y] ],
                [ [x,y], [x,y], [x,y] ],
                [ [x,y], [x,y], [x,y] ],
              ]
            */
            return [
                [[viewport.width * 0.66, viewport.height * 0.03], [chilliStem.x + (chilli.width * 0.1), chilliStem.y - (chilli.height * 0.1)], [chilliStem.x, chilliStem.y]],
                [[chilliStem.x - (chilli.width * 0.2), chilliStem.y + (chilli.height * 0.2)], [chilliApex.x + (chilli.width * 0.5), chilliApex.y - (chilli.height * 0.2)], [chilliApex.x, chilliApex.y]],
                [[chilliApex.x - (chilli.width * 0.2), chilliApex.y + (chilli.height * 0.07)], [viewport.width * (this.useSplitLayout ? 0.35 : 0.03), viewport.height], [viewport.width * (this.useSplitLayout ? 0.35 : 0), viewport.height * (this.useSplitLayout ? 1.3 : 1.15)]],
            ]
        },


        flavourCurveDrawCommand() {
            // Converts curve points into the form Cx y, x y, x y Cx y, x y, x y Cx y, x y, x y
            return this.curveData
                .map(bc => `C${bc.map(([x, y]) => `${x} ${y}`).join(', ')}`)
                .join(' ')
        },

        flavourShapeLeft() {
            return `
        M0,0
        L${this.viewport.width},0
        ${this.flavourCurveDrawCommand} Z`
        },

        flavourShapeRight() {
            // * 1.7 to overdraw shape at the bottom to make sure shape fills any extra scrolling space
            return `
        M${this.viewport.width},0
        ${this.flavourCurveDrawCommand}
        L${0},${this.viewport.height * 1.7}
        L${this.viewport.width},${this.viewport.height * 1.7} Z`
        },
    },

    watch: {
        flavour1(newVal, oldVal) {
            if (this.silentFlavourUpdate) return // don't emit "selected" events on first run
            let relatedProducts = this.halfAndHalfMode
                ? this.halfAndHalfFlavourContainer.getDisplayRelatedProducts()
                : this.productFlavours

            let matched = relatedProducts.find(flavour => flavour.getNormalisedFlavourCode() == this.flavour1)
            if (!matched) return
            /**
             * If in half-&-half mode AND we have a second flavour selected.
             * When the first flavour changes, we need to re-select the second flavour, making sure that
             * the second flavour is now a child of the new half-&-half first flavour
             */
            if (this.halfAndHalfMode && this.flavour2) {
                this.$emit('select', this.matchingHalfAndHalfProductForFlavour2)
            } else if (!this.halfAndHalfMode) { // only emit updates for flavour1 in single-flavour mode (when in half-&-half mode, we cant select the first flavour for the half and half container, as it isn't a leaf node)
                this.$emit('select', matched)

                // Auto close the flavour selection view after flavour selection is complete
                PrefersReducedMotion
                    ? this.$emit('done')
                    : addOnceEventListener(this.$el, 'transitionend', () => this.$emit('done'))
            }

        },

        flavour2() {
            if (this.silentFlavourUpdate) return // don't emit "selected" events on first run

            let matched = this.matchingHalfAndHalfProductForFlavuor1.getDisplayRelatedProducts()
                .find(hAHflavour => hAHflavour.getNormalisedFlavourCode() == this.flavour2)

            if (matched) {
                this.$emit('select', matched)

                // Auto close the flavour selection view after flavour selection is complete
                PrefersReducedMotion
                    ? this.$emit('done')
                    : addOnceEventListener(this.$el, 'transitionend', () => this.$emit('done'))
            }
        },

        halfAndHalfMode(newVal) {
            if (newVal) { // switching to half and half mode
                if (this.flavour1 && !this.matchingHalfAndHalfProductForFlavuor1) {
                    // The previously selected flavour1 (probably "no-sauce") isn't available in half-&-half, discard it
                    this.flavour1 = null
                }
            } else { // switching back to single flavour mode
                this.flavour2 = null
                //Select single flavour1 (instead of the flavour1 in half-&-half container)
                if (!this.flavour1) return
                let matched = this.productFlavours.find(flavour => flavour.getNormalisedFlavourCode() == this.flavour1)
                this.$emit('select', matched)
            }
        },
    },

    created() {
        // If flavour was already selected, update peri-omteter
        let selectedFlavour = this.productFlavours.find(flavour => flavour.isSelected())

        if (selectedFlavour) {
            this.halfAndHalfMode = selectedFlavour.isHalfAndHalfContainer()
            if (this.halfAndHalfMode) {
                this.flavour1 = this.halfAndHalfFlavourContainer.getDisplayRelatedProducts().find(p => p.isSelected()).getNormalisedFlavourCode()
                this.flavour2 = this.matchingHalfAndHalfProductForFlavuor1.getDisplayRelatedProducts().find(p => p.isSelected()).getNormalisedFlavourCode()
            } else {
                this.flavour1 = selectedFlavour.getNormalisedFlavourCode()
            }
        }

        // Avoid watch handlers for "flavour 1" from triggering
        Vue.nextTick(() => this.silentFlavourUpdate = false)
    },

    mounted() {
        this.debouncedComputeHalfAndHalfBgCurvePoints = debounce(this.computeHalfAndHalfBgCurvePoints, 250)
        window.addEventListener('resize', this.debouncedComputeHalfAndHalfBgCurvePoints)

        // Wait for page intro animation to complete, as the chilli needs to be in its final position before we measure it's position
        //addOnceEventListener(this.$el, 'transitionend', () => {
        setTimeout(() => {
            this.pageIntroAnimationComplete = true
            Vue.nextTick(this.computeHalfAndHalfBgCurvePoints)
        }, PrefersReducedMotion ? 10 : 950)
    },

    methods: {
        computeHalfAndHalfBgCurvePoints() {
            if (this.$refs.periOmeterBgLayer == null) return

            this.viewport = this.$refs.periOmeterBgLayer.getBoundingClientRect()

            /**
             * There is a case where the bounding rect for the peri-ometer SVG doesn't correspond to the
             * visual top of the chilli. The SVG preserves its aspect ratio, so when scaled very narrow,
             * there will be empty space above and below the actual graphic, which will throw off our
             * position calculations below
             */
            this.chilli = this.$refs.periOmeter.$el.getBoundingClientRect()

            // MS Edge Fixes
            if (this.viewport.x === undefined) this.viewport.x = this.viewport.left
            if (this.chilli.x === undefined) this.chilli.x = this.chilli.left

            this.chilliStem.x = this.chilli.x + this.chilli.width * 0.55
            this.chilliStem.y = this.chilli.top * 1.2 - this.appHeaderHeight

            this.chilliApex.x = this.chilli.x + this.chilli.width * 0.13
            this.chilliApex.y = this.chilli.bottom - (this.chilli.height * 0.02) - this.appHeaderHeight
        }
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.debouncedComputeHalfAndHalfBgCurvePoints)
    }
}