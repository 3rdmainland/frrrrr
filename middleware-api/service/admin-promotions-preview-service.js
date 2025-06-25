import '../util/admin-context-guard'
import { ClassDefinition as PromotionService } from './promotions-service'
import AdminLanguageService from './admin-language-service'
import Cache from './i18n-cache-service'
import MenuEntityService, { ENTITIES_CHANGED } from './authoring/menu-entity-service'

class AdminPromotionsPreviewService extends PromotionService {

  constructor() {
    super()
    MenuEntityService.addObserver(this, ENTITIES_CHANGED, () => Cache.clearAll(this.cacheKey))
  }

  /**
   * @override
   */
  get cacheKey() {
    return 'preview-promotions'
  }

  /**
   * @override
   */
  get endpoint() {
    return `/v2/pack/promotion/preview?languageIso=${AdminLanguageService.languageBaseKey}`
  }
}

export default new AdminPromotionsPreviewService()