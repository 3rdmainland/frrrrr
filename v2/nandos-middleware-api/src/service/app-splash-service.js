import ApiHttp from '../http';
import Promotion from '../model/promotion';
import Cache from './i18n-cache-service'
import MenuCategory, { CATEGORY_DISPLAY_TYPES } from '../model/menu-category'
import MenuDisplayItem from '../model/menu-display-item'

class AppSplashService {

  get cacheKey() {
    return 'app-splash'
  }

  get endpoint() {
    return '/v2/pack/app-splash'
  }

  getAppSplashPromotions() {
    return Cache.get(this.cacheKey) ||
      Cache.put(this.cacheKey, ApiHttp.get(this.endpoint)
        .then(result => result.data.promotions.map(promo => new Promotion(promo)))
        .then(this._createCategoryDisplayItemFromPromotions)
        .catch(error => Cache.clear(this.cacheKey)))
  }

  _createCategoryDisplayItemFromPromotions(promotions) {
    let category = MenuCategory.quickBuild(promotions)
    category.displayType = CATEGORY_DISPLAY_TYPES.CAROUSEL
    return new MenuDisplayItem(category)
  }
}

export default new AppSplashService()

export { AppSplashService as ClassDefinition }