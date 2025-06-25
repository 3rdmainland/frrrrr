import ApiHttp from '../http';
import Promotion from '../model/promotion';
import Cache from './i18n-cache-service'
import MenuCategory, { CATEGORY_DISPLAY_TYPES } from '../model/menu-category'
import MenuDisplayItem from '../model/menu-display-item'

class PromotionsService {

  get cacheKey() {
    return 'promotions'
  }

  get endpoint() {
    return '/v2/pack/promotion'
  }

  getPromotions() {
    return Cache.get(this.cacheKey) ||
      Cache.put(this.cacheKey, ApiHttp.get(this.endpoint)
        .then(result => result.data.promotions.map(promo => new Promotion(promo)))
        .catch(error => Cache.clear(this.cacheKey)))
  }

  getAppLandingPromotionCategory() {
    return this.getPromotions()
      .then(promotions => promotions
        .filter(p => p.appSplashScreen)
        .sort((a, b) => a.displayOrder - b.displayOrder)
      )
      .then(this._createCategoryDisplayItemFromPromotions)
  }

  _createCategoryDisplayItemFromPromotions(promotions) {
    let category = MenuCategory.quickBuild(promotions)
    category.displayType = CATEGORY_DISPLAY_TYPES.CAROUSEL
    return new MenuDisplayItem(category)
  }
}

export default new PromotionsService()

export { PromotionsService as ClassDefinition }