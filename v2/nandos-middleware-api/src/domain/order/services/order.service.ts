import { Observable } from '../../../core/utils/observable';
import { OrderRepository } from '../repositories/order.repository';
import { 
  Order, 
  OrderFilter, 
  OrderLog, 
  OrderEvent,
  DriverRecallRequest
} from '../types';

/**
 * Base service for order operations
 */
export abstract class OrderService extends Observable<OrderEvent> {
  constructor(protected orderRepository: OrderRepository) {
    super();
  }
  
  /**
   * Get orders with filtering and pagination
   * @param filters Filters to apply
   * @param pageNumber Page number
   * @param pageSize Page size
   * @returns Promise resolving to the orders and pagination info
   */
  async getOrders(filters: OrderFilter, pageNumber = 0, pageSize = 50): Promise<{ orders: Order[], totalPages: number, totalItems: number }> {
    return this.orderRepository.getOrders(filters, pageNumber, pageSize);
  }
  
  /**
   * Get all orders with filtering
   * @param filters Filters to apply
   * @returns Promise resolving to the orders
   */
  async getAllOrders(filters: OrderFilter): Promise<Order[]> {
    return this.orderRepository.getAllOrders(filters);
  }
  
  /**
   * Get an order by customer ID and order ID
   * @param customerId The customer ID
   * @param orderId The order ID
   * @returns Promise resolving to the order
   */
  async getOrder(customerId: string, orderId: string): Promise<Order> {
    return this.orderRepository.getOrder(customerId, orderId);
  }
  
  /**
   * Get order logs
   * @param customerId The customer ID
   * @param orderId The order ID
   * @returns Promise resolving to the order logs
   */
  async getOrderLogs(customerId: string, orderId: string): Promise<OrderLog[]> {
    return this.orderRepository.getOrderLogs(customerId, orderId);
  }
  
  /**
   * Update an order
   * @param order The order to update
   * @returns Promise resolving to the updated order
   */
  async updateOrder(order: Order): Promise<Order> {
    const updatedOrder = await this.orderRepository.updateOrder(order);
    this.notifyObservers('orderUpdated', updatedOrder);
    return updatedOrder;
  }
  
  /**
   * Refund an order
   * @param order The order to refund
   * @param refundComment The refund comment
   * @returns Promise resolving to the refunded order
   */
  async refundOrder(order: Order, refundComment: string): Promise<Order> {
    const refundedOrder = await this.orderRepository.refundOrder(order, refundComment);
    this.notifyObservers('orderUpdated', refundedOrder);
    return refundedOrder;
  }
  
  /**
   * Request an order refund
   * @param order The order to request a refund for
   * @returns Promise resolving to the order
   */
  async requestOrderRefund(order: Order): Promise<Order> {
    const updatedOrder = await this.orderRepository.requestOrderRefund(order);
    this.notifyObservers('orderUpdated', updatedOrder);
    return updatedOrder;
  }
  
  /**
   * Force an order failure
   * @param order The order to force failure for
   * @returns Promise resolving to the order
   */
  async forceFailure(order: Order): Promise<Order> {
    const updatedOrder = await this.orderRepository.forceFailure(order);
    this.notifyObservers('orderUpdated', updatedOrder);
    return updatedOrder;
  }
  
  /**
   * Request a driver recall
   * @param order The order to request a driver recall for
   * @param recallFormData The recall form data
   * @returns Promise resolving to the order
   */
  async requestDriverRecall(order: Order, recallFormData: DriverRecallRequest): Promise<Order> {
    const updatedOrder = await this.orderRepository.requestDriverRecall(order, recallFormData);
    this.notifyObservers('orderUpdated', updatedOrder);
    return updatedOrder;
  }
}