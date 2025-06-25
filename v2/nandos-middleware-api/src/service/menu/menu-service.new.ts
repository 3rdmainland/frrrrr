import Observable from "../../util/observable";
import Cache from "../i18n-cache-service";
import Menu from "../../model/menu";
import ApiHttp from "../../http";
import type { PromotionsService as PromotionsServiceType } from "../promotions-service";
/**
 * Base class for menu services
 * This class provides common functionality for menu services
 * Child classes must implement the abstract methods
 */
export default abstract class MenuServiceBase extends Observable {
  private _tempMenuPromise: Promise<Menu> | null = null;
  private _configuredProducts: Record<string, any> = {};

  constructor() {
    super();
  }

  /**
   * Gets the menu
   * Uses cached menu if available, otherwise fetches a new one
   */
  _getMenu(): Promise<Menu> {
    if (this._tempMenuPromise) return this._tempMenuPromise;

    this._tempMenuPromise = this._getSelectedMenuId()
      .then((selectedMenuId) => {
        let cachedMenu = Cache.get(this.cacheKey);
        let selectedMenuMatchesCache = cachedMenu && cachedMenu.id == selectedMenuId;
        let canUseDefaultMenu = selectedMenuId == null && cachedMenu && cachedMenu.baseMenu;

        // Check to see if we can return the menu we have in cache
        if (selectedMenuMatchesCache || canUseDefaultMenu) {
          this._tempMenuPromise = null;
          return cachedMenu;
        }
        // Else, fetch remote data for new menu
        else {
          this._dumpCache();
          return Promise.all([
            this._getRawMenuPayload(),
            this.promotionService.getPromotions(),
          ])
            .then(([menuPayload, promotions]) => new Menu(menuPayload, promotions))
            .then((menu) => {
              this._tempMenuPromise = null;
              Cache.put(this.cacheKey, menu);
              return menu;
            })
            .catch((e) => this.onMenuError(e));
        }
      })
      .catch((e) => this.onMenuError(e));

    return this._tempMenuPromise;
  }

  /**
   * Gets the raw menu payload from the API
   */
  _getRawMenuPayload(): Promise<any> {
    return this._getSelectedMenuId()
      .then((selectedMenuId) => ApiHttp.get(this._getMenuUrl(selectedMenuId)))
      .then((response) => response.data.menu);
  }

  /**
   * Gets the selected menu ID
   * Must be implemented by child classes
   */
  abstract _getSelectedMenuId(): Promise<string>;

  /**
   * Gets the menu URL for the given menu ID
   */
  _getMenuUrl(menuId: string): string {
    return `/v2/pack/menu/${menuId || "default"}`;
  }

  /**
   * Handles menu errors
   */
  onMenuError(e: Error): never {
    this._tempMenuPromise = null;
    this._dumpCache();
    throw e;
  }

  /**
   * Clears the cache
   */
  _dumpCache(): void {
    Cache.clear(this.cacheKey);
    this._configuredProducts = {};
  }

  /**
   * Gets the cache key for this menu service
   * Must be implemented by child classes
   */
  abstract get cacheKey(): string;

  /**
   * Gets the promotion service for this menu service
   * Must be implemented by child classes
   */
  abstract get promotionService(): PromotionsServiceType;
}
