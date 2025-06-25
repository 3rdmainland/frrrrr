import { ApiClient } from '../../core/http/api-client';
import { CacheService } from '../../core/cache/cache-service';
import { OrderRepository } from './repositories/order.repository';
import { MyOrderService } from './services/my-order.service';
import { AdminOrderService } from './services/admin-order.service';
import { PublicOrderService } from './services/public-order.service';

// Export all types
export * from './types';

// Export Vue composable hooks
export { useMyOrders } from './hooks/useMyOrders';
export { useOrderTracking } from './hooks/useOrderTracking';

// Create singleton instances
const apiClient = new ApiClient();
const cacheService = new CacheService();
const orderRepository = new OrderRepository(apiClient, cacheService);

// Create order services
export const myOrderService = new MyOrderService(orderRepository);
export const adminOrderService = new AdminOrderService(orderRepository);
export const publicOrderService = new PublicOrderService(orderRepository);

/**
 * This module provides a domain-driven implementation of order-related services.
 * 
 * The main services are:
 * - myOrderService: For managing the current user's orders
 * - adminOrderService: For administrative operations on orders
 * - publicOrderService: For public operations on orders
 * 
 * Vue composable hooks are also provided for easier integration with Vue components:
 * - useMyOrders: For working with the current user's orders
 * - useOrderTracking: For tracking orders
 * 
 * Example usage with services:
 * 
 * ```typescript
 * import { myOrderService } from 'nandos-middleware-api/src/domain/order';
 * 
 * // Get the current user's orders
 * const result = await myOrderService.getMyOrders();
 * const orders = result.orders;
 * 
 * // Get a specific order
 * const order = await myOrderService.getMyOrder('order-123');
 * ```
 * 
 * Example usage with Vue composables:
 * 
 * ```vue
 * <script setup>
 * import { useMyOrders } from 'nandos-middleware-api/src/domain/order';
 * 
 * const { orders, isLoading, error, loadOrders } = useMyOrders();
 * 
 * // Load orders with filters
 * loadOrders({ status: 'PLACED' });
 * </script>
 * 
 * <template>
 *   <div v-if="isLoading">Loading...</div>
 *   <div v-else-if="error">Error: {{ error.message }}</div>
 *   <div v-else>
 *     <h2>Your Orders</h2>
 *     <ul>
 *       <li v-for="order in orders" :key="order.id">
 *         {{ order.orderNumber }} - {{ order.status }}
 *       </li>
 *     </ul>
 *   </div>
 * </template>
 * ```
 * 
 * For order tracking:
 * 
 * ```vue
 * <script setup>
 * import { useOrderTracking } from 'nandos-middleware-api/src/domain/order';
 * 
 * const { order, isLoading, error, trackOrder, updateKerbsideState } = useOrderTracking();
 * 
 * // Track an order
 * trackOrder('order-token-123');
 * 
 * // Update kerbside state
 * const updateKerbside = () => {
 *   updateKerbsideState('ARRIVED', { latitude: 51.5074, longitude: -0.1278 });
 * };
 * </script>
 * ```
 */