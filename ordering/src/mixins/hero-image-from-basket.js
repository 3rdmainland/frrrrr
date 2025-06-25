export default {

  props: {
    menuService: { type: Object, required: true },
  },

  data () {
    return {
      heroImageCollection: null,
    }
  },
  
  watch: {
    basket() {
      if(!this.basket || !this.basket.items.length) return
      let mostExpensive = this.basket.items.reduce((prev, current) => (prev.productPrice > current.productPrice) ? prev : current)
      this.setHeaderImageFromBasketItem(mostExpensive)
    },
  },

  methods: {
    setHeaderImageFromBasketItem(item) {
      this.menuService.retrieveUserProduct(item.productId)
        .then(product => {
          this.heroImageCollection = product ? product.getImageCollection() : null
        }) 
    },
  }
}