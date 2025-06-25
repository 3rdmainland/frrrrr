import MenuDisplayItem from '../model/menu-display-item'
import UserProduct from '../model/user-product'
import ProductState from '../model/product-state'

function getUpsellsForProduct(userProduct, basket, menu) {
  return getUpsells(basket, menu, userProduct.generateSelectionIdentifier())
}

function getUpsells(basket, menu, productStateIdentifier = null) {

  let collector = {};
  let basketItemsMap = {};
  let { productMap, productMapByDefinitionId, categoryMap } = menu;

  (basket.items || []).forEach(item => {
    if (item.productId in productMap) {
      let isCollectionEnbled = true;
      if(productStateIdentifier) {
        let product = productMap[item.productId]
        let basketItemAsState = product.configureFromBasketItem(item, new ProductState())
        let basketItemStateIdentifier = Object.keys(basketItemAsState.selection).sort().toString()
        isCollectionEnbled = basketItemStateIdentifier == productStateIdentifier
      }

      _collectUpsells(item, productMap[item.productId], collector, basketItemsMap, isCollectionEnbled)
    }
  })

  return Object.values(collector)
    .map(upsell => {  // point upsell's `item` to it's target product/category
      let definition = upsell.target.destinationType == 'PRODUCT_DEFINITION'
        ? productMapByDefinitionId[upsell.target.destinationId]
        : categoryMap[upsell.target.destinationId]


      upsell.item = definition && new MenuDisplayItem(definition)

      return upsell
    })
    .filter(upsell => upsell.item != null) // filter out upsells not found in menu
    .filter(upsell => { // filter out upsells that already exist in user's basket
      if(upsell.item.isProduct) {
        return !(upsell.item.product.getDefinitionId() in basketItemsMap)
      }
      else {
        // If the upsell is a category, filter it out if the user's basket contains any products that exist within this upsell category
        return !basket.items
          .some(basketItem => {
            let product = productMap[basketItem.productId]
            if(!product) return false // basket item points to a product that doesn't exist in the menu
            let basketItemAsState = product.configureFromBasketItem(basketItem, new ProductState())
            let userProduct = new UserProduct(product, basketItemAsState)
            return userProduct.getSelectedProducts()
              .some(p => upsell.item.category.containsProduct(p.getDefinitionId()))
          })       
      }
    })
    .filter(upsell => upsell.item.available) // filter out upsells that are unavailable
    .sort((a, b) => a.weight - b.weight)
    .reverse()
}

function _collectUpsells(basketItem, product, collector, basketItemsMap, isCollectionEnbled) {
  let match = (product.id == basketItem.productId) ? product : product.getRelatedProduct(basketItem.productId)

  if (match) {
    basketItemsMap[match.definitionId] = true;
    if (match.upsells && isCollectionEnbled) {
      match.upsells.forEach(upsellTarget => {
        let id = upsellTarget.destinationId
        let upsell = collector[id] || new Upsell();
        collector[id] = upsell.detected(match, upsellTarget);
      })
    }

    if(basketItem.subItems) {
      basketItem.subItems.forEach(s => _collectUpsells(s, product, collector, basketItemsMap, isCollectionEnbled))
    }
  }
}

class Upsell {

  constructor() {
    this.origins = {}
    this.target = null // {destinationId, destinationType } pointing to a PRODUCT_DEFINITION or CATEGORY_DEFINITION
    this.item = null // a MenuDisplayItem that either containing a 'Product' or 'MenuCategory'
    this.weight = null
  }

  detected(origin, upsellTarget) {
    this.origins[origin.id] = origin
    this.target = upsellTarget
    this.weight += upsellTarget.weight || 0
    return this
  }

}

export default {getUpsells, getUpsellsForProduct}