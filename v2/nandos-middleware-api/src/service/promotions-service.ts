import ApiHttp from '../http';
import Promotion from '../model/promotion';
import Cache from './i18n-cache-service'
import MenuCategory from '../model/menu-category'
import MenuDisplayItem from '../model/menu-display-item'
import { CATEGORY_DISPLAY_TYPES } from '@nandos-types/model/menu-category';
import type { TPromotionPacks } from '@nandos-types/response/promotion-pack';

class PromotionsService {

  get cacheKey() {
    return 'promotions';
  }

  get endpoint() {
    return '/v2/pack/promotion';
  }

  getPromotions(): Promotion[] | Promise<Promotion[]>  {
    return Cache.get(this.cacheKey) ||
      Cache.put(
        this.cacheKey, 
        ApiHttp.get<TPromotionPacks>(this.endpoint)
          .then(result => result.data.promotions.map(promo => new Promotion(promo)))
          .catch(error => Cache.clear(this.cacheKey))
      );
  }

  async getAppLandingPromotionCategory() {
    let promotions = await this.getPromotions();

    if (!promotions) return null;
    
    promotions = promotions.filter((p) => p.appSplashScreen)
                  .sort((a, b) => a.displayOrder - b.displayOrder);

    return this._createCategoryDisplayItemFromPromotions(promotions);
  }

  private _createCategoryDisplayItemFromPromotions(promotions: Promotion[]) {
    const category = MenuCategory.quickBuild(promotions);
    category.displayType = CATEGORY_DISPLAY_TYPES.CAROUSEL;
    return new MenuDisplayItem(category);
  }
}

export default new PromotionsService()

export { PromotionsService as ClassDefinition }