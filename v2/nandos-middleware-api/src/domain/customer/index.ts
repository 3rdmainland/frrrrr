import { ApiClient } from '../../core/http/api-client';
import { CacheService } from '../../core/cache/cache-service';
import { CustomerRepository } from './repositories/customer.repository';
import { MeService } from './services/me.service';
import { SelectedCustomerService } from './services/selected-customer.service';

// Export all types
export * from './types';

// Export Vue composable hooks
export { useCustomer } from './hooks/useCustomer';
export { useSelectedCustomer } from './hooks/useSelectedCustomer';

// Create singleton instances
const apiClient = new ApiClient();
const cacheService = new CacheService();
const customerRepository = new CustomerRepository(apiClient, cacheService);
export const meService = new MeService(customerRepository, apiClient);
export const selectedCustomerService = new SelectedCustomerService(customerRepository);

/**
 * This module provides a domain-driven implementation of customer-related services.
 * 
 * The main services are:
 * - meService: For managing the current customer
 * - selectedCustomerService: For managing a selected customer
 * 
 * Vue composable hooks are also provided for easier integration with Vue components:
 * - useCustomer: For working with the current customer
 * - useSelectedCustomer: For working with a selected customer
 * 
 * Example usage with services:
 * 
 * ```typescript
 * import { meService } from 'nandos-middleware-api/src/domain/customer';
 * 
 * // Get the current customer
 * const customer = await meService.getMe();
 * 
 * // Update the current customer
 * await meService.updateCustomer({ name: 'John', lastName: 'Doe' });
 * ```
 * 
 * Example usage with Vue composables:
 * 
 * ```vue
 * <script setup>
 * import { useCustomer } from 'nandos-middleware-api/src/domain/customer';
 * 
 * const { customer, isLoading, error, updateCustomer } = useCustomer();
 * 
 * const updateName = () => {
 *   updateCustomer({ name: 'John', lastName: 'Doe' });
 * };
 * </script>
 * 
 * <template>
 *   <div v-if="isLoading">Loading...</div>
 *   <div v-else-if="error">Error: {{ error.message }}</div>
 *   <div v-else-if="customer">
 *     <h2>{{ customer.name }} {{ customer.lastName }}</h2>
 *     <button @click="updateName">Update Name</button>
 *   </div>
 * </template>
 * ```
 */