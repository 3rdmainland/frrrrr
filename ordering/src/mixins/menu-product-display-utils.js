import Vue from 'vue'
import Tracker from '../e-commerce-tracker-adapter'
import ProductUpseller from '../components/menu/product/product-upseller/product-upseller.vue'
import { getMenuItemUrl } from '../components/menu/menu-tile/menu-tile.js'
import ABTesting from 'nandos-a-b-testing'
import { menuServiceKey, basketServiceKey, globalConfigServiceKey, languageServiceKey, isPreviewKey } from '../utils/ordering-provider-utils'

export default {
  
  inject: {
    menuService: menuServiceKey,
    basketService: basketServiceKey,
    globalConfigService: globalConfigServiceKey,
    languageService: languageServiceKey,
    preview: isPreviewKey,
  },

  props: {
    data: { required: true },
    displayAutoconfiguredOnly: { type: Boolean, default: true },
    redirect: { type: String },
  },

  data() {
    return {
      addToBasketLoading: false,
    }
  },

  computed: {
    productDescription() {
      return this.isAutoConfigOnly
        ? this.data.autoconfigDescription
        : this.data.description
    },

    productPrice() {
      return this.isAutoConfigOnly && (this.data.price != this.data.autoconfigPrice)
        ? this.data.autoconfigPrice
        : this.data.price
    },

    productUrl() {
      let redirect = this.redirect ? {redirect: this.redirect, jump: true} : undefined
      return getMenuItemUrl(this.data, this.$route, this.preview, redirect)
    },

    isAutoConfigOnly() {
      return this.data.isAutoconfigured && this.displayAutoconfiguredOnly 
    },

    displayFeatures() {
      return this.data.features
        .filter(feature => !['highlighted-config'].includes(feature.id) && feature.icon && feature.icon.path)
        .reduce((acc, feature) => {acc[feature.id] = feature; return acc}, {})
    },

    canSingleClickAddToBasket() {
      return ABTesting.getValue('hideBagOne') != true &&
        this.data.product.isAvailable() &&
        (this.data.isAutoconfigured ? this.data.autoconfigProduct.isConfigured() : this.data.product.isConfigured())
    },
  },

  methods: {

    addToBasket() {

      if(this.preview) return this.$toaster.show('Basket unavailable during preview')

      this.addToBasketLoading = true
      Promise.all([this.basketService.getBasketSummary(), this.globalConfigService.getConfigs()])
        .then(([basket, configs]) => {
          if(configs.forceOrderSetupBeforeAddToBasket == true && basket.isOrderSetup == false) {
            this.$toaster.show("Set up your order before we get cookin’", {error: true, parent: this});
            return this.$router.push({name: 'order-setup-start', query: {redirect: this.$route.fullPath, jump: true}})
          }

          let product = this.isAutoConfigOnly ? this.data.autoconfigProduct : this.data.product
          product.orderQuantity = 1

          return this.basketService.addBasketItem(product)
            .then(() => {
              Tracker.track('addToCart', product)  
              //
              // let props = { product: product, menuService: this.menuService, basketService: this.basketService, languageService: this.languageService, globalConfigService: this.globalConfigService, parent: this }
              // let upseller = this.$toaster.showInstance( Vue.extend(ProductUpseller), props)
              // // If there are no upsells to display, we will display a normal toast with a "added to your basket" message
              // let fallbackMsg = this.$t('productDetail.addToBasket.new.success')
              // upseller.$once('upsells-retrieved', (count) => {
              //   if(count == 0) this.$toaster.show(fallbackMsg, {success:true, parent: this})
              // })
              this.$toaster.show(this.$t('productDetail.addToBasket.new.success'), {success: true, parent: this})
            })
            .catch(e => this.$toaster.show( this.$t('productDetail.addToBasket.serverError'), {error: true, parent: this}))

        })
        .finally(() => this.addToBasketLoading = false)        
    },

    onProductClicked(useAutoconfigProduct) {
      Tracker.track('productClick', this.data.product, this.data.trackingCategory)

      let product = (useAutoconfigProduct || (this.isAutoConfigOnly))
        ? this.data.autoconfigProduct
        : this.data.product

      this.menuService.registerUserProduct(product)
    },
  }
}