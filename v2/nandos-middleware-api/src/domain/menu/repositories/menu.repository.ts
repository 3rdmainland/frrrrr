import { ApiClient } from '../../../core/http/api-client';
import { CacheService } from '../../../core/cache/cache-service';
import Menu from '../../../model/menu';
import { IMenu } from "@nandos-types/model/menu";
import { MenuResponse } from '../types';
import ApiHttp from '../../../http';
import Promotion from "../../../model/promotion";
import { IPromotion } from "@nandos-types/model/promotion";

/**
 * Repository for menu data
 */
export class MenuRepository {
  private cache: CacheService;
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient, cache: CacheService) {
    this.apiClient = apiClient;
    this.cache = cache;
  }

  /**
   * Get a menu by ID
   * @param menuId The menu ID or null for the default menu
   * @returns Promise resolving to the menu
   */
  async getMenu(menuId: string | null | undefined): Promise<IMenu> {
    const cacheKey = `menu:${menuId || 'default'}`;

    // Check cache first
    const cachedMenu = this.cache.get<IMenu>(cacheKey);
    if (cachedMenu) {
      return cachedMenu;
    }

    // Fetch from API
    const menuUrl = `/v2/pack/menu/${menuId || 'default'}`;
    const response = await this.apiClient.get<MenuResponse>(menuUrl);
    const menuData = response.data.menu;

    // Get promotions
    const promotions = await this.getPromotions();

    // Create menu instance
    const menu = new Menu(menuData, promotions);

    // Cache the result
    this.cache.put(cacheKey, menu);

    return menu;
  }

  /**
   * Get promotions
   * @returns Promise resolving to an array of promotions
   */
  async getPromotions(): Promise<IPromotion[]> {
    const cacheKey = 'promotions';

    // Check cache first
    const cachedPromotions = this.cache.get<IPromotion[]>(cacheKey);
    if (cachedPromotions) {
      return cachedPromotions;
    }

    // Fetch from API
    try {
      const response = await ApiHttp.get('/v2/pack/promotion');
      const promotions = response.data.promotions.map((promo: any) => ({
        ...promo
      }));

      // Cache the result
      this.cache.put(cacheKey, promotions);

      return promotions;
    } catch (error) {
      console.error('Error fetching promotions:', error);
      return [];
    }
  }

  /**
   * Clear the cache
   * @param menuId Optional menu ID to clear only that menu's cache
   */
  clearCache(menuId?: string): void {
    if (menuId) {
      this.cache.clear(`menu:${menuId}`);
    } else {
      this.cache.clearPattern('menu:*');
    }

    // Also clear promotions cache
    this.cache.clear('promotions');
  }
}
