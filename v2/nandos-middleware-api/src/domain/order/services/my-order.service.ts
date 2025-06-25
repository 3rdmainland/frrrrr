import { OrderService } from './order.service';
import { OrderRepository } from '../repositories/order.repository';
import { Order, OrderFilter, BasketReviewStatus } from '../types';

/**
 * Service for managing the current user's orders
 */
export class MyOrderService extends OrderService {
  private customerId: string = 'me';
  
  constructor(orderRepository: OrderRepository) {
    super(orderRepository);
  }
  
  /**
   * Get the current user's orders
   * @param filters Filters to apply
   * @param pageNumber Page number
   * @param pageSize Page size
   * @returns Promise resolving to the orders and pagination info
   */
  async getMyOrders(filters: OrderFilter = {}, pageNumber = 0, pageSize = 50): Promise<{ orders: Order[], totalPages: number, totalItems: number }> {
    // Add customerId to filters
    const myFilters = { ...filters, customerId: this.customerId };
    return this.getOrders(myFilters, pageNumber, pageSize);
  }
  
  /**
   * Get a specific order for the current user
   * @param orderId The order ID
   * @returns Promise resolving to the order
   */
  async getMyOrder(orderId: string): Promise<Order> {
    return this.getOrder(this.customerId, orderId);
  }
  
  /**
   * Get logs for a specific order for the current user
   * @param orderId The order ID
   * @returns Promise resolving to the order logs
   */
  async getMyOrderLogs(orderId: string): Promise<any[]> {
    return this.getOrderLogs(this.customerId, orderId);
  }
  
  /**
   * Get an order pending review for the current user
   * @returns Promise resolving to the order pending review or null if none
   */
  async getPendingReview(): Promise<Order | null> {
    return this.orderRepository.getPendingReview(this.customerId);
  }
  
  /**
   * Submit a review for an order
   * @param orderId The order ID
   * @param reviewStatus The review status
   * @param reviewFoodScore The review food score
   * @param reviewDeliveryScore The review delivery score
   * @param reviewComment The review comment
   * @returns Promise resolving to the reviewed order
   */
  async submitReview(
    orderId: string,
    reviewStatus: BasketReviewStatus,
    reviewFoodScore: number,
    reviewDeliveryScore: number,
    reviewComment: string
  ): Promise<Order> {
    const order = await this.orderRepository.submitReview(
      this.customerId,
      orderId,
      reviewStatus,
      reviewFoodScore,
      reviewDeliveryScore,
      reviewComment
    );
    
    this.notifyObservers('orderUpdated', order);
    return order;
  }
  
  /**
   * Get an invoice for an order
   * @param orderId The order ID
   * @param email The email to send the invoice to
   * @returns Promise resolving to a boolean indicating success
   */
  async getOrderInvoice(orderId: string, email: string): Promise<boolean> {
    // This method would need to be implemented in the repository
    // For now, we'll just return true
    return true;
  }
}