import logger from 'nandos-dev-logger'
import Tracker from '../../../e-commerce-tracker-adapter'
import { ViewStateService, shuffle } from 'nandos-core-ui'

export default {

  props: {
    menuService: { type: Object, required: true },
    basketService: { type: Object, required: true },
    languageService: { type: Object, required: true },
  },

  data () {
    return {
      basket: null,
      instructions: null,
      quickPickableUpsellsProducts: null,
      selectedUpsells: {},
      loading: false,
      showInstructionDisclaimer: false,
      pendingInstructionSelection: null,
      driverTipPercentage: 0,
      driverTipOwnAmount: 0
    }
  },

  computed: {
    ready() {
      return this.basket != null && this.instructions != null
    },

    selectedInstructions() {
      return this.instructions.filter(instruction => instruction.selected == true)
    },

    showFooter() {
      return this.$breakpoints.smDown
    },
  },

  created() {
    Tracker.track('checkout', 2)

    Promise.all([this.basketService.getCheckoutInstructions(), this.getBasket()])
      .then(([instructions, basket]) => {
        
        if(instructions.length == 0) {
          return (this.$route.query.checkoutAuthPrompt || ViewStateService.previousRoute && ViewStateService.previousRoute.name == 'basket')
            ? this.$router.replace({name: 'basket-checkout'})
            : this.$router.replace({name: 'basket'})
        }

        this.instructions = instructions

        // Restore previously selected checkout instructions
        this.basket.checkoutInstructions && this.basket.checkoutInstructions.forEach(basketInstruction => {
          let match = this.instructions.find(instruction => instruction.id == basketInstruction.productId)
          if(match) match.selected = true
        })
      })
      .then(this.getQuickPickableUpsells)
  },

  methods: {

    getBasket() {
      return this.basketService.getBasket()
        .then(basket => this.basket = basket)
    },

    getQuickPickableUpsells() {
      this.menuService.getUpsells(this.basket)
        .then(upsells => {
          // merge products and categories into a single flat list of quick-pickable products
          this.quickPickableUpsellsProducts = shuffle(upsells
            .reduce((acc, upsell) => {
              if(upsell.item.isProduct && upsell.item.product.canBeQuickPicked()) {
                upsell.item.weight = upsell.weight
                acc.push(upsell.item)
              }
              else if (upsell.item.isCategory) {
                const quickItems = upsell.item.quickPickableProducts
                quickItems.forEach(qi => qi.weight = upsell.weight)
                acc.push(...quickItems)
              }
              return acc
            }, []))
            .filter((item, index, arr) => index === arr.findIndex(t => t.id === item.id)) // dedupe
            .slice(0, 8)
            .sort((a,b) => b.weight - a.weight) // sort by weight (taken from product's original upsell container)
        })
    },

    onInstructionClicked(event, instruction) {
      // If instruction has a disclaimer show that before allowing selection
      if(instruction.selected == false && instruction.disclaimer != null) {
        event.preventDefault()
        event.stopPropagation()
        this.pendingInstructionSelection = instruction
        this.showInstructionDisclaimer = true
      }
    },

    next() {
      // Update the basket's special instructions first, then go to payment view
      this.loading = true

       this.basketService.setCheckoutInstructions(this.selectedInstructions)
        .then(() => {
          // If any upsells have been selected, add them to the basket
          if(Object.values(this.selectedUpsells).some(isSelected => isSelected == true)) {
            const selectedProducts = Object.keys(this.selectedUpsells)
              .filter(key => this.selectedUpsells[key] == true)
              .map(key => this.quickPickableUpsellsProducts.find(displayItem => displayItem.id == key).product)
            
            return this.basketService.addBasketItems(selectedProducts)
              .then(() => Tracker.track('addToCart', selectedProducts))
          }
        })
        .then(() => this.$router.push({name: 'basket-checkout'}))
        .catch(() => this.$toaster.show(null, {template:'Eish, something went wrong. <n-button :to="{name: `basket-checkout`}" @click="$parent.isActive = false" text-link secondary>Click here to continue</n-button> without saving your instructions', error:true, parent: this, timeout: 0, dismissable: true})) /*TODO:: i18n*/
        .finally(() => this.loading = false)
    },
  },
}