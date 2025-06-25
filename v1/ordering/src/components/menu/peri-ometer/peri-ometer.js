import { addOnceEventListener } from 'nandos-core-ui'
import PrefersReducedMotion from 'nandos-core-ui/src/utils/prefers-reduced-motion'

export default {

  props: {
    flavour1: { type: String },
    flavour2: { type: String },
    halfAndHalf: { type: Boolean, default: false },
    selectableFlavours: { type: Array, required: true },
  },

  data() {
    return {
      introAnimationComplete: PrefersReducedMotion ? true : false,
      selectingFirstFlavour: true,
    }
  },

  computed: {
    classes() {
      return ({
        'peri-ometer': true,
        'peri-ometer--intro-animation': !this.introAnimationComplete,
        ['peri-ometer--f1-' + this.flavour1]: this.flavour1 != null,
        ['peri-ometer--f2-' + this.flavour2]: this.flavour2 != null,
      })
    },
  },

  watch: {
    halfAndHalf() {
      // when switching to half-&-half, and we already have our first flavour, go straight into selecting the second flavour
      if(this.halfAndHalf && this.flavour1) this.selectingFirstFlavour = false
      else if(!this.halfAndHalf) this.selectingFirstFlavour = true
    },
  },

  mounted() {

    /**
     * Remove intro animation class from peri-ometer. This class applies CSS animation to SVG
     * elements, but must be removed after the animation completes, as CSS animations prevent CSS
     * transitions from taking an effect.
     */
    addOnceEventListener(this.$refs.periOmeterLabel, 'animationend', () => this.introAnimationComplete = true)
  },

  methods: {
    onFlavourClicked(flavour) {
      if(flavour == this.flavour1 || flavour == this.flavour2) return
      // emit updated value (either for flavour1 or flavour2)
      this.$emit(`update:${this.selectingFirstFlavour ? 'flavour1' : 'flavour2'}`, flavour)
      // toggle the flavour the user will be setting next
      if(this.halfAndHalf) this.selectingFirstFlavour = !this.selectingFirstFlavour
    },
  },
}