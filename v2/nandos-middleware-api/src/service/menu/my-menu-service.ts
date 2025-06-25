import '../../util/web-context-guard'
import MenuService, { MENU_CHANGED } from './menu-service'
import MyBehaviorService, { BEHAVIOR_CHANGED } from '../customer-behavior/my-behavior-service'
import MyPreferenceService, { PREFERENCE_CHANGED } from '../customer-preference/my-preference-service'
import MyBasketService from '../basket/my-basket-service'
import PromotionsService from '../promotions-service'
import type { PromotionsService as PromotionsServiceType } from '../promotions-service'
import MyProductAvailabilityService, { AVAILABILITY_CHANGED } from '../product-availability/my-product-availability-service'
import MyLanguageService, { LANGUAGE_CHANGED } from '../my-language-service'
import type Menu from '../../model/menu'

class MyMenuService extends MenuService {
  private lastMenuId: string | null = null;
  private menuPostProcessingCompleted = false; // indicates whether product availability and behaviour data has been applied to menu yet
  private _postProcessPromise: Promise<Menu> | null = null;

  constructor() {
    super();

    MyProductAvailabilityService.menuService = this;

    MyPreferenceService.addObserver(this, PREFERENCE_CHANGED, () => {
      super._getMenu()
        .then(menu => MyPreferenceService.applyTo(menu))
        .then(menu => this.notifyObservers(MENU_CHANGED));
    });

    MyBehaviorService.addObserver(this, BEHAVIOR_CHANGED, () => {
      super._getMenu()
        .then(menu => MyBehaviorService.applyTo(menu))
        .then(menu => this.notifyObservers(MENU_CHANGED));
    });

    MyProductAvailabilityService.addObserver(this, AVAILABILITY_CHANGED, () => {
      super._getMenu()
        .then(menu => MyProductAvailabilityService.applyTo(menu))
        .then(menu => this.notifyObservers(MENU_CHANGED));
    });

    MyLanguageService.addObserver(this, LANGUAGE_CHANGED, () => {
      this._configuredProducts = {};
      this.notifyObservers(MENU_CHANGED);
    });
  }

  /**
   * @override
   */
  get cacheKey(): string {
    return 'my-menu';
  }

  /**
   * @override
   */
  get promotionService(): PromotionsServiceType {
    return PromotionsService;
  }

  /**
   * @override
   */
  protected _getSelectedMenuId(): Promise<string | null> {
    return MyBasketService.getSelectedMenuId();
  }

  /**
   * @override
   */
  protected _getMenu(): Promise<Menu> {
    return super._getMenu()
      .then(menu => {
        let menuChanged = menu.id !== this.lastMenuId;
        if (menuChanged || !this.menuPostProcessingCompleted) {

          if (menuChanged) {
            this.lastMenuId = menu.id;
            this.menuPostProcessingCompleted = false;
            this._postProcessPromise = null;
          }

          return this._postProcessPromise ||
            (
              this._postProcessPromise = Promise.all([
                MyBehaviorService.applyTo(menu), 
                MyProductAvailabilityService.applyTo(menu), 
                MyPreferenceService.applyTo(menu)
              ])
                .then(() => {
                  this.menuPostProcessingCompleted = true;
                  this._postProcessPromise = null;
                  return menu;
                })
            );
        }
        else {
          return menu;
        }
      });
  }

  /**
   * @override
   */
  protected _getUserBehaviors(): Promise<any[]> {
    return MyBehaviorService.getBehaviorData();
  }

  /**
   * @override
   */
  protected _dumpCache(): void {
    this.lastMenuId = null;
    super._dumpCache();
  }
}

export default new MyMenuService();

// Re-export base service's constants for convenience 
export { MENU_CHANGED } from './menu-service';
