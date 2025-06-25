import { MenuRepository } from '../repositories/menu.repository';
import AutoComboService from '../../../service/auto-combo-service';
import UpsellService from '../../../service/upsell-service';
import type UserProduct from '../../../model/user-product';
import type { Basket, AutoComboMatch, Upsell } from '../types';

/**
 * Service for upsells and auto-combos
 */
export class MenuUpsellService {
  constructor(
    private menuRepository: MenuRepository,
    private autoComboService: typeof AutoComboService,
    private upsellService: typeof UpsellService
  ) {}
  
  /**
   * Get auto-combo matches for a basket
   * @param basket The basket
   * @param menuId Optional menu ID
   * @returns Promise resolving to an array of auto-combo matches
   */
  async getAutoComboMatches(
    basket: Basket,
    menuId?: string | null
  ): Promise<AutoComboMatch[]> {
    const menu = await this.menuRepository.getMenu(menuId);
    return this.autoComboService.autocombo(basket, menu);
  }
  
  /**
   * Get upsells for a basket
   * @param basket The basket
   * @param menuId Optional menu ID
   * @returns Promise resolving to an array of upsells
   */
  async getUpsells(
    basket: Basket,
    menuId?: string | null
  ): Promise<Upsell[]> {
    const menu = await this.menuRepository.getMenu(menuId);
    return this.upsellService.getUpsells(basket, menu);
  }
  
  /**
   * Get upsells for a product
   * @param userProduct The user product
   * @param basket The basket
   * @param menuId Optional menu ID
   * @returns Promise resolving to an array of upsells
   */
  async getProductUpsells(
    userProduct: UserProduct,
    basket: Basket,
    menuId?: string | null
  ): Promise<Upsell[]> {
    const menu = await this.menuRepository.getMenu(menuId);
    return this.upsellService.getUpsellsForProduct(userProduct, basket, menu);
  }
}