const ALLERGENS = 'ALLERGENS'
const NUTRITION = 'NUTRITION'

export default {

  props: {
    menuService: { type: Object, required: true },
    productDefinitionId: { type: String, required: true },
    preview: { type: Boolean },
  },

  data() {
    return {
      ALLERGENS,
      NUTRITION,
      activeTab: null,
      userProduct: null,
      nutritionalComponents: null,
      CALL_CENTER_PHONE: process.env.VUE_APP_CALL_CENTER_PHONE,
    }
  },

  computed: {
    ready() {
      return this.userProduct != null && this.nutritionalComponents != null
    },

    hasAnyNutritionalInfo() {
      return this.productsWithNutritionalInfo.length > 0
    },

    hasAnyAllergenInfo() {
      return this.productsWithAllergenInfo.length > 0
    },

    /**
     * If the top level product/meal has nutritional info, simply return that, otherwise build up nutritional info
     * from selected products within meal
     */
    productsWithNutritionalInfo() {
      if(this.userProduct.hasNutritionalInfo()) return [this.userProduct]

      return this.userProduct
        .getSelectedProducts()
        .filter(up => up.hasNutritionalInfo())
    },

    /**
     * If the top level product/meal has allergen info, simply return that, otherwise build up allergen info
     * from selected products within meal
     */
    productsWithAllergenInfo() {
      if(this.userProduct.hasAllergenInfo()) return [this.userProduct]

      return this.userProduct
        .getSelectedProducts()
        .filter(up => up.hasAllergenInfo())
    },

    tabs() {
      let tabs = []
      if(this.hasAnyNutritionalInfo)
        tabs.push(NUTRITION)
      if(this.hasAnyAllergenInfo)
        tabs.push(ALLERGENS)
      return tabs
    },
  },

  created() {
    Promise.all([this.menuService.retrieveUserProductFromDefinitionId(this.productDefinitionId), this.menuService.getNutritionalComponents()])
      .then(([userProduct, nutritionalComponents]) => {
        this.userProduct = userProduct
        this.nutritionalComponents = nutritionalComponents

        this.activeTab = this.tabs[0]
      })
  },
}