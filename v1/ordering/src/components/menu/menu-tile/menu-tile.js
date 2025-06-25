import logger from 'nandos-dev-logger'
import { CATEGORY_DISPLAY_TYPES } from 'nandos-middleware-api/model/menu-category'
import MenuDisplayItem from 'nandos-middleware-api/model/menu-display-item'

export default {
  
  props: {
    data: {  required: true },
  },

  computed: {

    /**
     * If the item is a category that has only 1 child, and that child is a product, flatten
     * the category to a product
     */
    canFlattenToProduct() {
      return this.data.isCategory && this.data.children.length == 1 && this.data.children[0].isProduct
    },

    componentType() {
      if(this.data.isProduct || this.canFlattenToProduct) {
        return 'n-ordering-menu-product-tile'
      }
      else if(this.data.isPromotion) {
        return 'n-ordering-menu-promo-tile'
      }
      else if(this.data.surpriseMe) {
        return 'n-ordering-menu-surprise-me-tile'
      }
      else if(this.data.isCategory) {
        switch(this.data.displayType) {
          case CATEGORY_DISPLAY_TYPES.CAROUSEL:
            return 'n-ordering-menu-category-carousel-tile'; break;
          case CATEGORY_DISPLAY_TYPES.MOST_POPULAR:
          case CATEGORY_DISPLAY_TYPES.RECOMMENDATION:
            return 'n-ordering-menu-category-recommendation-tile'; break;
          default:
            return 'n-ordering-menu-category-default-tile'; break;
        }
      }
      else {
        return logger.warn('Nandos Ordering', 'Menu tile:: Unable to determine appropriate component')
      }
    },

    componetData() {
      return this.canFlattenToProduct ? this.data.children[0] : this.data
    }
  },
}

export function getMenuItemUrl(item/*MenuDisplayItem*/, currentRoute, isPreview, queryParams = {}) {
  if(item instanceof MenuDisplayItem == false) item = new MenuDisplayItem(item)

  if(item.isProduct) {
    return getProductUrl(item.idPath, currentRoute, isPreview, queryParams)
  }
  else if (item.isCategory) {
    return getCategoryUrl(item.idPath, false, currentRoute, isPreview, queryParams)
  }
  else if (item.isPromotion) {
    return getPromotionUrl(item.promotion, currentRoute, isPreview, queryParams)
  }
}

export function getProductUrl(productDefinitionId, currentRoute, isPreview, queryParams = {}) {
  let next = {
    name: isPreview ? 'preview-product-detail' : 'product-detail',
    query: Object.assign({}, currentRoute.query, queryParams),
    params: Object.assign({}, currentRoute.params, {productDefinitionId})
  }
  
  return next
}

export function getCategoryUrl(categoryDefinitionId, forceFromRoot, currentRoute, isPreview, queryParams = {}) {
  let browsePath = ((!forceFromRoot && currentRoute.params.path) || '')
    .split('/')
    .filter(p => p != '')
    .concat([categoryDefinitionId])
    .join('/')

  let next = {
    name: isPreview ? 'preview-menu' : 'menu',
    query: Object.assign({}, currentRoute.query, queryParams),
    params: Object.assign({}, currentRoute.params, {path: browsePath}),
  }

  return next
}

export function getPromotionUrl(promotion, currentRoute, isPreview, queryParams = {}) {
  logger.warn('Nandos Ordering', 'TODO:: external links will attempt to go through router - fix')
  if(promotion.youtubeId) {
    return `https://www.youtube.com/watch?v=${promotion.youtubeId}`
  }
  if(promotion.linkIsExternal) {
    return promotion.link
  }
  else {
    return currentRoute.path.includes('/menu') ? currentRoute.path + promotion.internalPath.replace('/menu', '') : promotion.internalPath
  }
}