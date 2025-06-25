import { ref, computed, onMounted, onUnmounted } from 'vue';
import { myOrderService } from '../index';
import type { Order, OrderFilter, OrderEvent, BasketReviewStatus } from '../types';
import type { Observer } from '../../../core/utils/observable';

/**
 * Composable hook for working with the current user's orders
 * @returns Object containing order data, loading state, error state, and methods to interact with orders
 */
export function useMyOrders() {
  const orders = ref<Order[]>([]);
  const totalPages = ref<number>(0);
  const totalItems = ref<number>(0);
  const currentPage = ref<number>(0);
  const isLoading = ref<boolean>(false);
  const error = ref<Error | null>(null);
  const pendingReview = ref<Order | null>(null);
  
  // Observer for order changes
  const orderObserver: Observer<OrderEvent> = {
    notify: (event: OrderEvent, updatedOrder: Order) => {
      if (event === 'orderUpdated') {
        // Update the order in the list if it exists
        const index = orders.value.findIndex(o => o.id === updatedOrder.id);
        if (index >= 0) {
          orders.value[index] = updatedOrder;
        }
        
        // Update pending review if it's the same order
        if (pendingReview.value && pendingReview.value.id === updatedOrder.id) {
          pendingReview.value = updatedOrder;
        }
      }
    }
  };
  
  /**
   * Load orders with filtering and pagination
   * @param filters Filters to apply
   * @param pageNumber Page number
   * @param pageSize Page size
   */
  const loadOrders = async (filters: OrderFilter = {}, pageNumber = 0, pageSize = 50) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await myOrderService.getMyOrders(filters, pageNumber, pageSize);
      orders.value = result.orders;
      totalPages.value = result.totalPages;
      totalItems.value = result.totalItems;
      currentPage.value = pageNumber;
    } catch (err) {
      error.value = err as Error;
      console.error('Error loading orders:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Load a specific order
   * @param orderId The order ID
   */
  const loadOrder = async (orderId: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const order = await myOrderService.getMyOrder(orderId);
      
      // Update the order in the list if it exists
      const index = orders.value.findIndex(o => o.id === order.id);
      if (index >= 0) {
        orders.value[index] = order;
      } else {
        orders.value.push(order);
      }
    } catch (err) {
      error.value = err as Error;
      console.error('Error loading order:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Load an order pending review
   */
  const loadPendingReview = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      pendingReview.value = await myOrderService.getPendingReview();
    } catch (err) {
      error.value = err as Error;
      console.error('Error loading pending review:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Submit a review for an order
   * @param orderId The order ID
   * @param reviewStatus The review status
   * @param reviewFoodScore The review food score
   * @param reviewDeliveryScore The review delivery score
   * @param reviewComment The review comment
   */
  const submitReview = async (
    orderId: string,
    reviewStatus: BasketReviewStatus,
    reviewFoodScore: number,
    reviewDeliveryScore: number,
    reviewComment: string
  ) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const order = await myOrderService.submitReview(
        orderId,
        reviewStatus,
        reviewFoodScore,
        reviewDeliveryScore,
        reviewComment
      );
      
      // Update the order in the list if it exists
      const index = orders.value.findIndex(o => o.id === order.id);
      if (index >= 0) {
        orders.value[index] = order;
      }
      
      // Clear pending review if it's the same order
      if (pendingReview.value && pendingReview.value.id === order.id) {
        pendingReview.value = null;
      }
    } catch (err) {
      error.value = err as Error;
      console.error('Error submitting review:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Get an invoice for an order
   * @param orderId The order ID
   * @param email The email to send the invoice to
   */
  const getOrderInvoice = async (orderId: string, email: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await myOrderService.getOrderInvoice(orderId, email);
    } catch (err) {
      error.value = err as Error;
      console.error('Error getting order invoice:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  // Computed properties
  const isEmpty = computed(() => orders.value.length === 0);
  const hasPendingReview = computed(() => pendingReview.value !== null);
  
  // Add observer on mount
  onMounted(() => {
    myOrderService.addObserver('orderUpdated', orderObserver);
    loadOrders();
    loadPendingReview();
  });
  
  // Remove observer on unmount
  onUnmounted(() => {
    myOrderService.removeObserver('orderUpdated', orderObserver);
  });
  
  return {
    orders,
    totalPages,
    totalItems,
    currentPage,
    isLoading,
    error,
    pendingReview,
    isEmpty,
    hasPendingReview,
    loadOrders,
    loadOrder,
    loadPendingReview,
    submitReview,
    getOrderInvoice
  };
}