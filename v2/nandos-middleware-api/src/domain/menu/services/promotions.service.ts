import { MenuRepository } from '../repositories/menu.repository';
import type { IPromotion } from '@nandos-types/model/promotion';

/**
 * Service for promotions
 */
export class PromotionsService {
  constructor(private menuRepository: MenuRepository) {}

  /**
   * Get promoted products/promotions
   * @param limit Maximum number of promotions to return
   * @returns Promise resolving to an array of promotions with additional UI fields
   */
  async getPromotedProducts(limit?: number): Promise<IPromotion[]> {
    try {
      const promotions = await this.menuRepository.getPromotions();

      if (!Array.isArray(promotions)) {
        console.warn('Promotions data is not an array:', promotions);
        return [];
      }

      // Apply limit if specified
      const result = limit ? promotions.slice(0, limit) : promotions;

      // Transform promotions to include fields expected by the UI
      return result.map(promo => ({
        ...promo,
        // Map IPromotion fields to UI expected fields
        price: 0, // Promotions don't have prices, but UI expects it
        imageUrl: promo.images?.[0]?.path || null,
        isPromo: true,
        isSpecial: true,
        isNew: false,
        isPopular: false
      }));
    } catch (error) {
      console.error('Error fetching promoted products:', error);
      return [];
    }
  }

  /**
   * Get a specific promotion by ID
   * @param promotionId The promotion ID
   * @returns Promise resolving to the promotion or null if not found
   */
  async getPromotionById(promotionId: string): Promise<IPromotion | null> {
    try {
      const promotions = await this.getPromotedProducts();
      return promotions.find(promo => promo.id === promotionId) || null;
    } catch (error) {
      console.error('Error fetching promotion by ID:', error);
      return null;
    }
  }

  /**
   * Get active promotions
   * @param limit Maximum number of promotions to return
   * @returns Promise resolving to an array of active promotions
   */
  async getActivePromotions(limit?: number): Promise<IPromotion[]> {
    try {
      const promotions = await this.getPromotedProducts();
      const now = Date.now(); // Use timestamp to match dateStart/dateEnd format

      const activePromotions = promotions.filter(promo => {
        // Check if promotion is currently active using the correct field names
        const startDate = promo.dateStart || 0;
        const endDate = promo.dateEnd || Number.MAX_SAFE_INTEGER;

        return now >= startDate && now <= endDate;
      });

      return limit ? activePromotions.slice(0, limit) : activePromotions;
    } catch (error) {
      console.error('Error fetching active promotions:', error);
      return [];
    }
  }
}