import Observable from "../../util/observable";
import ApiHttp from "../../http";
import Menu from "../../model/menu";
import UserProduct from "../../model/user-product";
import MenuDisplayItem from "../../model/menu-display-item";
import ProductState from "../../model/product-state";
import Cache from "../i18n-cache-service";
import type { PromotionsService as PromotionsServiceType } from "../promotions-service";
import type Product from "../../model/product";
import AutoComboService from "../auto-combo-service";
import UpsellService from "../upsell-service";
import KeywordService from "../keyword-service";
import KeywordAutoconfigurator from "../keyword-autoconfig-service";
import BehaviorAutoconfigurator from "../behavior-autoconfig-service";

export const MENU_CHANGED = "MENU_CHANGED";

export default class MenuService extends Observable {
  private _tempMenuPromise: Promise<Menu> | null = null;
  private _configuredProducts: Record<string, UserProduct> = {};

  constructor() {
    super();
  }

  /**
   * Browse a menu category by path
   * @param path Path to the category
   * @returns A MenuDisplayItem representing the category
   */
  public browse(path: string): Promise<MenuDisplayItem> {
    return this._getMenu().then(
      (menu) => new MenuDisplayItem(menu.browse([path])),
    );
  }

  /**
   * Search for products by query
   * @param query Search query
   * @returns Array of MenuDisplayItems matching the query
   */
  public search(query: string): Promise<MenuDisplayItem[]> {
    return KeywordService.resolveKeywords(query).then((keywords) => {
      return this._getMenu().then((menu) => this._search(menu, keywords));
    });
  }

  /**
   * Get a random product
   * @param productPredicate Function to filter products
   * @param configurePredicate Function to filter configurations or false to skip configuration
   * @returns A random UserProduct
   */
  public getRandomProduct(
    productPredicate?: (product: Product) => boolean,
    configurePredicate?: ((product: Product) => boolean) | false,
  ): Promise<UserProduct> {
    return this.getRandomProducts(1, productPredicate, configurePredicate).then(
      (products) => products[0],
    );
  }

  /**
   * Get multiple random products
   * @param count Number of products to return
   * @param productPredicate Function to filter products
   * @param configurePredicate Function to filter configurations or false to skip configuration
   * @returns Array of UserProducts
   */
  public getRandomProducts(
    count: number,
    productPredicate?: (product: Product) => boolean,
    configurePredicate?: ((product: Product) => boolean) | false,
  ): Promise<UserProduct[]> {
    return this._getMenu().then((menu) => {
      return menu.getRandomProducts(count, productPredicate).map((product) => {
        let state = new ProductState();

        if (configurePredicate !== false) {
          const configurePredicateIsFn =
            typeof configurePredicate === "function";

          const getSelectionCandidates = (parent: Product): Product[] => { // Remove undefined from return type
            let children = parent.getRelatedProducts();
            if (configurePredicateIsFn && configurePredicate) {
              children = children?.filter(child => configurePredicate(child));
            }

            if (!children || children.length === 0) {
              return [];
            }

            let requiredChildren = children.filter(rp => rp.requiresSelection());
            if (requiredChildren.length) {
              return requiredChildren;
            } else {
              return [children[Math.floor(children.length * Math.random())]];
            }
          };
          const selectProduct = (candidates: Product[]): void => {
            candidates.forEach((candidate) => {
              candidate.isLeaf()
                ? candidate.select(state)
                : selectProduct(getSelectionCandidates(candidate));
            });
          };

          selectProduct(getSelectionCandidates(product));
        }

        return new UserProduct(product, state);
      });
    });
  }

  /**
   * Get recommended products based on user behaviors
   * @param limit Maximum number of products to return
   * @returns Array of MenuDisplayItems
   */
  public getRecommendedProducts(limit = 5): Promise<MenuDisplayItem[]> {
    return Promise.all([this._getMenu(), this._getUserBehaviors()]).then(
      ([menu, behaviours]) => {
        return behaviours
          .sort((a, b) => b.score - a.score)
          .map((b) => menu.productMapByDefinitionId[b.productDefinitionId]) // convert to product
          .filter((p) => p !== null && p.isAvailable()) // filter out products not available in this menu and products that are unavailable
          .slice(0, limit)
          .map((product) => {
            let userProduct = new UserProduct(product, new ProductState());
            BehaviorAutoconfigurator.autoconfigure(
              userProduct.product,
              userProduct.state,
            );
            return new MenuDisplayItem(
              userProduct,
              userProduct.getConfigurationDescription() !== "",
            );
          });
      },
    );
  }

  /**
   * Get quick links from the menu
   * @returns Array of MenuDisplayItems representing quick links
   */
  public getQuickLinks(): Promise<MenuDisplayItem[]> {
    return this._getMenu().then((menu) =>
      menu.quickLinks
        .map((ql) => new MenuDisplayItem(ql))
        .filter((i) => !i.isEmpty),
    );
  }

  /**
   * Get the product map from the menu
   * @returns Record of product IDs to Products
   */
  public getProductMap(): Promise<Record<string, Product>> {
    return this._getMenu().then((menu) => menu.productMap);
  }

  /**
   * Get nutritional components from the menu
   * @returns Array of nutritional components
   */
  public getNutritionalComponents(): Promise<any[]> {
    return this._getMenu().then((menu) =>
      Object.values(menu.productNutritionalComponentsMap).sort(
        (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
      ),
    );
  }

  /**
   * Register a user product in the cache
   * @param userProduct The user product to register
   */
  public registerUserProduct(userProduct: UserProduct): void {
    userProduct.orderQuantity = 1; // reset order quantity when a product is registered/re-registered
    this._configuredProducts[userProduct.product.id] = userProduct;
  }

  /**
   * Retrieve a user product by ID
   * @param productId The product ID
   * @param bypassCache Whether to bypass the cache
   * @returns The user product
   */
  public retrieveUserProduct(
    productId: string,
    bypassCache = false,
  ): Promise<UserProduct | null> {
    return this._getMenu().then((menu) => {
      if (bypassCache === false && productId in this._configuredProducts) {
        return this._configuredProducts[productId];
      }

      let result = menu.productMap[productId];

      if (result) {
        result = new UserProduct(result, new ProductState());
        if (bypassCache === false) this.registerUserProduct(result);
      }
      return result || null;
    });
  }

  /**
   * The frontend uses product Definition Id's for the URLs (so URLs work across menus)
   * So it needs a way to retrieve UserProducts using the definition ID
   * @param productDefinitionId The product definition ID
   * @param rest Additional parameters to pass to retrieveUserProduct
   * @returns The user product
   */
  public retrieveUserProductFromDefinitionId(
    productDefinitionId: string,
    ...rest: [boolean?]
  ): Promise<UserProduct | null> {
    return this._getMenu().then((menu) => {
      let product = menu.productMapByDefinitionId[productDefinitionId];
      return product ? this.retrieveUserProduct(product.id, ...rest) : null;
    });
  }

  /**
   * Get the product definition ID from an OHEICS ID
   * @param oheicsId The OHEICS ID
   * @returns The product definition ID
   * @deprecated To be removed in v16
   */
  public getProductDefinitionIdFromOheicsId(oheicsId: string): Promise<string> {
    return ApiHttp.get(`/v2/pack/product/resolve/${oheicsId}`).then(
      (response) => response.data.productDefinitionId,
    );
  }

  /**
   * Get the current menu ID
   * @returns The current menu ID
   */
  public getCurrentMenuId(): string | undefined {
    return Cache.get(this.cacheKey) && Cache.get(this.cacheKey).id;
  }

  /**
   * Get auto combo matches for a basket
   * @param basket The basket
   * @returns Auto combo matches
   */
  public getAutoComboMatches(basket: any): Promise<any> {
    return this._getMenu().then((menu) =>
      AutoComboService.autocombo(basket, menu),
    );
  }

  /**
   * Get upsells for a basket
   * @param basket The basket
   * @returns Upsells
   */
  public getUpsells(basket: any): Promise<any> {
    return this._getMenu().then((menu) =>
      UpsellService.getUpsells(basket, menu),
    );
  }

  /**
   * Get upsells for a product
   * @param userProduct The user product
   * @param basket The basket
   * @returns Upsells
   */
  public getProductUpsells(
    userProduct: UserProduct,
    basket: any,
  ): Promise<any> {
    return this._getMenu().then((menu) =>
      UpsellService.getUpsellsForProduct(userProduct, basket, menu),
    );
  }

  /**
   * Get the cache key for this menu service
   * Must be implemented by child classes
   */
  get cacheKey(): string {
    throw new Error(
      "This must be implemented by the parent class. Each menu service must provide its own unique cache key",
    );
  }

  /**
   * Get the promotion service for this menu service
   * Must be implemented by child classes
   */
  get promotionService(): PromotionsServiceType {
    throw new Error(
      "This must be implemented by the parent class. Each menu service must provide the appropriate promotions service instance to use",
    );
  }

  /**
   * Get user behaviors
   * Must be implemented by child classes
   * @returns Promise resolving to user behaviors
   */
  protected _getUserBehaviors(): Promise<any[]> {
    return Promise.reject(
      "This method must be implemented by the parent class",
    );
  }

  /**
   * Get the selected menu ID
   * Must be implemented by child classes
   * @returns Promise resolving to the selected menu ID
   */
  protected _getSelectedMenuId(): Promise<string | null> {
    return Promise.reject(
      "This method must be implemented by the parent class",
    );
  }

  /**
   * Get the selected store ID
   * Must be implemented by child classes
   * @returns Promise resolving to the selected store ID
   */
  protected _getSelectedStoreId(): Promise<string | null> {
    return Promise.reject(
      "This method must be implemented by the parent class",
    );
  }

  /**
   * Get the menu URL for the given menu ID
   * @param menuId The menu ID
   * @returns The menu URL
   */
  protected _getMenuUrl(menuId: string | null): string {
    return `/v2/pack/menu/${menuId || "default"}`;
  }

  /**
   * Get the menu
   * Uses cached menu if available, otherwise fetches a new one
   * @returns Promise resolving to the menu
   */
  protected _getMenu(): Promise<Menu> {
    if (this._tempMenuPromise) return this._tempMenuPromise;

    this._tempMenuPromise = this._getSelectedMenuId()
      .then((selectedMenuId) => {
        let cachedMenu = Cache.get(this.cacheKey);
        let selectedMenuMatchesCache =
          cachedMenu && cachedMenu.id === selectedMenuId;
        let canUseDefaultMenu =
          selectedMenuId === null && cachedMenu && cachedMenu.baseMenu;

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
            .then(
              ([menuPayload, promotions]) => new Menu(menuPayload, promotions),
            )
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
   * Get the raw menu payload from the API
   * @returns Promise resolving to the menu payload
   */
  protected _getRawMenuPayload(): Promise<any> {
    return this._getSelectedMenuId()
      .then((selectedMenuId) => ApiHttp.get(this._getMenuUrl(selectedMenuId)))
      .then((response) => response.data.menu);
  }

  /**
   * Handle menu errors
   * @param e The error
   */
  protected onMenuError(e: Error): never {
    this._tempMenuPromise = null;
    this._dumpCache();
    throw e;
  }

  /**
   * Search the menu for products matching the given keywords
   * @param menu The menu to search
   * @param keywords The keywords to search for
   * @returns Array of MenuDisplayItems matching the keywords
   */
  protected _search(menu: Menu, keywords: string[]): MenuDisplayItem[] {
    let results = menu
      .search(keywords, 30)
      .filter((result) => !result.product.isHiddenByExclusion()); // Filter out products hidden by the "hidden" execution rule

    results.forEach((r) => {
      let state = new ProductState();
      let autoconf = KeywordAutoconfigurator.autoconfigure(
        r.product,
        keywords,
        state,
      );
      r.autoconfig = autoconf.hits > 0;
      if (r.autoconfig) {
        r.score *= autoconf.hits * 0.5 + 1;
      }
      r.score *= r.product.userRelevance * 0.1 + 1;
      if (r.product.searchBias) {
        r.score *= r.product.searchBias;
      }
      r.product = new UserProduct(r.product, state);
    });

    results.sort((a, b) => b.score - a.score);

    return results.map((r) => new MenuDisplayItem(r.product, r.autoconfig));
  }

  /**
   * Clear the cache
   */
  protected _dumpCache(): void {
    Cache.clear(this.cacheKey);
    this._configuredProducts = {};
  }
}
