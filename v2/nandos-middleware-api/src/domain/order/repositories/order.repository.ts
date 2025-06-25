import { ApiClient } from '../../../core/http/api-client';
import { CacheService } from '../../../core/cache/cache-service';
import { 
  Order, 
  OrderFilter, 
  OrderLog, 
  DriverRecallRequest 
} from '../types';
import objToFormData from '../../../util/obj-to-form-data';

/**
 * Repository for order data
 */
export class OrderRepository {
  private cache: CacheService;
  private apiClient: ApiClient;
  
  constructor(apiClient: ApiClient, cache: CacheService) {
    this.apiClient = apiClient;
    this.cache = cache;
  }
  
  /**
   * Get orders with filtering and pagination
   * @param filters Filters to apply
   * @param pageNumber Page number
   * @param pageSize Page size
   * @returns Promise resolving to the orders and pagination info
   */
  async getOrders(filters: OrderFilter, pageNumber = 0, pageSize = 50): Promise<{ orders: Order[], totalPages: number, totalItems: number }> {
    const response = await this.apiClient.post<{ orders: Order[], totalPages: number, totalItems: number }>(
      '/admin/orders/list',
      objToFormData({ ...filters, pageNumber, pageSize })
    );
    
    return response;
  }
  
  /**
   * Get all orders with filtering
   * @param filters Filters to apply
   * @returns Promise resolving to the orders
   */
  async getAllOrders(filters: OrderFilter): Promise<Order[]> {
    const response = await this.getOrders(filters, 0, Number.MAX_SAFE_INTEGER);
    return response.orders;
  }
  
  /**
   * Get an order by customer ID and order ID
   * @param customerId The customer ID
   * @param orderId The order ID
   * @returns Promise resolving to the order
   */
  async getOrder(customerId: string, orderId: string): Promise<Order> {
    const cacheKey = `order:${customerId}:${orderId}`;
    
    // Check cache first
    const cachedOrder = this.cache.get<Order>(cacheKey);
    if (cachedOrder) {
      return cachedOrder;
    }
    
    // Fetch from API
    const response = await this.apiClient.get<{ basket: Order }>(`/customers/${customerId}/basket/history/${orderId}`);
    const order = response.basket;
    
    // Cache the result
    this.cache.put(cacheKey, order);
    
    return order;
  }
  
  /**
   * Get order logs
   * @param customerId The customer ID
   * @param orderId The order ID
   * @returns Promise resolving to the order logs
   */
  async getOrderLogs(customerId: string, orderId: string): Promise<OrderLog[]> {
    const response = await this.apiClient.get<{ logs: OrderLog[] }>(`/customers/${customerId}/basket/history/${orderId}/errors`);
    return response.logs;
  }
  
  /**
   * Get order locations
   * @param filters Filters to apply
   * @returns Promise resolving to the order locations
   */
  async getOrderLocations(filters: OrderFilter): Promise<any> {
    const response = await this.apiClient.post<{ result: any }>('/admin/orders/location/report', objToFormData(filters));
    return response.result;
  }
  
  /**
   * Get order frequencies
   * @param filters Filters to apply
   * @returns Promise resolving to the order frequencies
   */
  async getOrderFrequencies(filters: OrderFilter): Promise<any> {
    const response = await this.apiClient.post<{ result: any }>('/admin/orders/frequency/report', objToFormData(filters));
    return response.result;
  }
  
  /**
   * Get customer orders report
   * @param filters Filters to apply
   * @param pageNumber Page number
   * @param pageSize Page size
   * @returns Promise resolving to the customer orders report
   */
  async getCustomerOrdersReport(filters: OrderFilter, pageNumber = 0, pageSize = 50): Promise<any> {
    const response = await this.apiClient.post<any>(
      '/admin/orders/customers/report',
      objToFormData({ ...filters, pageNumber, pageSize })
    );
    return response;
  }
  
  /**
   * Update an order
   * @param order The order to update
   * @returns Promise resolving to the updated order
   */
  async updateOrder(order: Order): Promise<Order> {
    const response = await this.apiClient.put<{ basket: Order }>('/admin/orders', order);
    const updatedOrder = response.basket;
    
    // Update cache
    const cacheKey = `order:${order.customerId}:${order.id}`;
    this.cache.put(cacheKey, updatedOrder);
    
    return updatedOrder;
  }
  
  /**
   * Refund an order
   * @param order The order to refund
   * @param refundComment The refund comment
   * @returns Promise resolving to the refunded order
   */
  async refundOrder(order: Order, refundComment: string): Promise<Order> {
    const response = await this.apiClient.post<{ basket: Order }>(`/admin/orders/refund/${order.id}`, { refundComment });
    const refundedOrder = response.basket;
    
    // Update cache
    const cacheKey = `order:${order.customerId}:${order.id}`;
    this.cache.put(cacheKey, refundedOrder);
    
    return refundedOrder;
  }
  
  /**
   * Request an order refund
   * @param order The order to request a refund for
   * @returns Promise resolving to the order
   */
  async requestOrderRefund(order: Order): Promise<Order> {
    const response = await this.apiClient.post<{ basket: Order }>(`/admin/orders/refund/request/${order.id}`);
    const updatedOrder = response.basket;
    
    // Update cache
    const cacheKey = `order:${order.customerId}:${order.id}`;
    this.cache.put(cacheKey, updatedOrder);
    
    return updatedOrder;
  }
  
  /**
   * Force an order failure
   * @param order The order to force failure for
   * @returns Promise resolving to the order
   */
  async forceFailure(order: Order): Promise<Order> {
    const response = await this.apiClient.post<{ basket: Order }>(`/admin/orders/force-failure/${order.id}`);
    const updatedOrder = response.basket;
    
    // Update cache
    const cacheKey = `order:${order.customerId}:${order.id}`;
    this.cache.put(cacheKey, updatedOrder);
    
    return updatedOrder;
  }
  
  /**
   * Request a driver recall
   * @param order The order to request a driver recall for
   * @param recallFormData The recall form data
   * @returns Promise resolving to the order
   */
  async requestDriverRecall(order: Order, recallFormData: DriverRecallRequest): Promise<Order> {
    const response = await this.apiClient.post<{ basket: Order | null }>(`/admin/orders/driver-recall/${order.id}`, recallFormData);
    
    if (response.basket === null) {
      throw new Error("Failed to request the driver due to an unknown error. Please try again later.");
    }
    
    const updatedOrder = response.basket;
    
    // Update cache
    const cacheKey = `order:${order.customerId}:${order.id}`;
    this.cache.put(cacheKey, updatedOrder);
    
    return updatedOrder;
  }
  
  /**
   * Get pending review
   * @param customerId The customer ID
   * @returns Promise resolving to the order pending review or null if none
   */
  async getPendingReview(customerId: string): Promise<Order | null> {
    const response = await this.apiClient.get<{ basket: Order | null }>(`/customers/${customerId}/basket/review`);
    return response.basket;
  }
  
  /**
   * Submit a review
   * @param customerId The customer ID
   * @param id The order ID
   * @param reviewStatus The review status
   * @param reviewFoodScore The review food score
   * @param reviewDeliveryScore The review delivery score
   * @param reviewComment The review comment
   * @returns Promise resolving to the reviewed order
   */
  async submitReview(
    customerId: string,
    id: string,
    reviewStatus: string,
    reviewFoodScore: number,
    reviewDeliveryScore: number,
    reviewComment: string
  ): Promise<Order> {
    const response = await this.apiClient.put<{ basket: Order }>(
      `/customers/${customerId}/basket/review`,
      { id, reviewStatus, reviewFoodScore, reviewDeliveryScore, reviewComment }
    );
    return response.basket;
  }
  
  /**
   * Get an order by token (public)
   * @param token The order token
   * @returns Promise resolving to the order
   */
  async getOrderByToken(token: string): Promise<Order> {
    const response = await this.apiClient.get<{ basket: Order }>(`/public/basket?id=${token}`);
    return response.basket;
  }
  
  /**
   * Update kerbside state
   * @param token The order token
   * @param status The kerbside status
   * @param coordinates The coordinates
   * @returns Promise resolving to the updated data
   */
  async updateKerbsideState(token: string, status: string, coordinates?: { latitude: number; longitude: number }): Promise<any> {
    const response = await this.apiClient.put<any>('/public/basket/kerbside', { basketId: token, status, coordinates });
    return response;
  }
  
  /**
   * Clear the cache for an order
   * @param customerId The customer ID
   * @param orderId The order ID
   */
  clearCache(customerId?: string, orderId?: string): void {
    if (customerId && orderId) {
      this.cache.clear(`order:${customerId}:${orderId}`);
    } else if (customerId) {
      this.cache.clearPattern(`order:${customerId}:*`);
    } else {
      this.cache.clearPattern('order:*');
    }
  }
}