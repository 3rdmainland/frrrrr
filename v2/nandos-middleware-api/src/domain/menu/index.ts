import { ApiClient } from '../../core/http/api-client';
import { CacheService } from '../../core/cache/cache-service';
import { MenuRepository } from './repositories/menu.repository';
import { MenuQueryService } from './services/menu-query.service';
import { ProductService } from './services/product.service';
import { RecommendationService } from './services/recommendation.service';
import { MenuUpsellService } from './services/upsell.service';
import { MenuSelectionService } from './services/menu-selection.service';
import KeywordService from '../../service/keyword-service';
import AutoComboService from '../../service/auto-combo-service';
import UpsellService from '../../service/upsell-service';
import MyBehaviorService from '../../service/customer-behavior/my-behavior-service';
import { PromotionsService } from "./services/promotions.service";

// Export Vue composable hooks
export { useMenu } from './hooks/useMenu';
export { useProduct } from './hooks/useProduct';

// Export all types
export * from './types';

// Create singleton instances
const apiClient = new ApiClient();
const cacheService = new CacheService();

// Create menu services
const menuRepository = new MenuRepository(apiClient, cacheService);
const menuSelectionService = new MenuSelectionService();
const menuQueryService = new MenuQueryService(menuRepository, KeywordService);
const productService = new ProductService(menuRepository);
const recommendationService = new RecommendationService(menuRepository, MyBehaviorService);
const menuUpsellService = new MenuUpsellService(menuRepository, AutoComboService, UpsellService);
const promotionService = new PromotionsService(menuRepository)

// Export service instances
export {
  menuQueryService,
  productService,
  recommendationService,
  menuUpsellService,
  menuRepository,
  menuSelectionService,
  promotionService,
};


/**
 * This module provides a domain-driven implementation of menu-related services.
 * 
 * The main services are:
 * - menuQueryService: For browsing and searching the menu
 * - productService: For retrieving and managing products
 * - recommendationService: For getting product recommendations
 * - menuUpsellService: For getting upsells and auto-combo matches
 * - menuSelectionService: For managing menu selection
 * 
 * Vue composable hooks are also provided for easier integration with Vue components:
 * - useMenu: For browsing and searching the menu
 * - useProduct: For retrieving and managing products
 * 
 * These services can be used alongside the existing menu service implementation.
 * 
 * Example usage with services:
 * 
 * ```typescript
 * import { menuQueryService, menuSelectionService } from 'nandos-middleware-api/src/domain/menu';
 * 
 * // Set the selected menu ID
 * menuSelectionService.setSelectedMenuId('menu-123');
 * 
 * // Browse a menu category
 * const category = await menuQueryService.browse('main');
 * 
 * // Search for products
 * const searchResults = await menuQueryService.search('chicken');
 * ```
 * 
 * Example usage with Vue composables:
 * 
 * ```vue
 * <script setup>
 * import { useMenu, useProduct } from 'nandos-middleware-api/src/domain/menu';
 * 
 * const { menuItems, loadMenu } = useMenu('main');
 * const { product } = useProduct('product-123');
 * </script>
 * ```
 */
