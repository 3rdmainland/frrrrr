import { ref, computed } from 'vue';
import { publicOrderService } from '../index';
import type { Order } from '../types';

/**
 * Composable hook for tracking orders
 * @param initialToken Optional initial order token to track
 * @returns Object containing order data, loading state, error state, and methods to interact with order tracking
 */
export function useOrderTracking(initialToken?: string) {
  const order = ref<Order | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<Error | null>(null);
  const token = ref<string | null>(initialToken || null);
  
  /**
   * Track an order by token
   * @param orderToken The order token
   */
  const trackOrder = async (orderToken: string) => {
    if (!orderToken) return;
    
    token.value = orderToken;
    isLoading.value = true;
    error.value = null;
    
    try {
      order.value = await publicOrderService.getOrderByToken(orderToken);
    } catch (err) {
      error.value = err as Error;
      console.error('Error tracking order:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Update kerbside state
   * @param status The kerbside status
   * @param coordinates The coordinates
   */
  const updateKerbsideState = async (
    status: string,
    coordinates?: { latitude: number; longitude: number }
  ) => {
    if (!token.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      await publicOrderService.updateKerbsideState(token.value, status, coordinates);
      
      // Refresh the order to get the updated state
      if (token.value) {
        order.value = await publicOrderService.getOrderByToken(token.value);
      }
    } catch (err) {
      error.value = err as Error;
      console.error('Error updating kerbside state:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Refresh the current order
   */
  const refreshOrder = async () => {
    if (!token.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      order.value = await publicOrderService.getOrderByToken(token.value);
    } catch (err) {
      error.value = err as Error;
      console.error('Error refreshing order:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  // Computed properties
  const isTracking = computed(() => !!token.value);
  const hasOrder = computed(() => !!order.value);
  const orderStatus = computed(() => order.value?.status || null);
  const isKerbside = computed(() => order.value?.kerbsideCollect || false);
  const kerbsideState = computed(() => order.value?.kerbsideState || null);
  
  // Load initial order if token is provided
  if (initialToken) {
    trackOrder(initialToken);
  }
  
  return {
    order,
    isLoading,
    error,
    token,
    isTracking,
    hasOrder,
    orderStatus,
    isKerbside,
    kerbsideState,
    trackOrder,
    updateKerbsideState,
    refreshOrder
  };
}