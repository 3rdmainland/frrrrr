
// Export all types
export * from './types';

// Export repositories
export { BasketRepository, basketRepository } from './repository/basket.repository';

// Export services
export { BasketService, basketService } from './services/basket.service';
export { MyBasketService, myBasketService } from './services/my-basket.service';

// Export Vue composable hooks
export { useBasket } from './hooks/useBasket';
export { useMyBasket } from './hooks/useMyBasket';

/**
 * This module provides a domain-driven implementation of basket-related services.
 *
 * The main components are:
 * - basketRepository: For handling API interactions related to the basket
 * - basketService: For managing the basket state and business logic
 * - myBasketService: Extended service with customer-specific features
 *
 * Vue composable hooks are also provided for easier integration with Vue components:
 * - useBasket: For working with the standard basket service
 * - useMyBasket: For working with the extended basket service
 *
 * Example usage with the service:
 *
 * ```typescript
 * import { basketService } from 'nandos-middleware-api/src/domain/basket';
 *
 * // Add an item to the basket
 * basketService.addItem({
 *   id: 'item-123',
 *   productId: 'product-123',
 *   quantity: 1,
 *   price: 10.99,
 *   name: 'Chicken'
 * });
 *
 * // Get the basket
 * const basket = basketService.getBasket();
 **/