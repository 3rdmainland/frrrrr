import { Observable } from '../../../core/utils/observable';
import { OrderRepository } from '../repositories/order.repository';
import { Order, OrderEvent } from '../types';

/**
 * Service for public operations on orders
 */
export class PublicOrderService extends Observable<OrderEvent> {
  constructor(private orderRepository: OrderRepository) {
    super();
  }
  
  /**
   * Get an order by token
   * @param token The order token
   * @returns Promise resolving to the order
   */
  async getOrderByToken(token: string): Promise<Order> {
    return this.orderRepository.getOrderByToken(token);
  }
  
  /**
   * Update kerbside state
   * @param token The order token
   * @param status The kerbside status
   * @param coordinates The coordinates
   * @returns Promise resolving to the updated data
   */
  async updateKerbsideState(
    token: string,
    status: string,
    coordinates?: { latitude: number; longitude: number }
  ): Promise<any> {
    const result = await this.orderRepository.updateKerbsideState(token, status, coordinates);
    
    // If we had access to the updated order, we could notify observers
    // this.notifyObservers('orderUpdated', updatedOrder);
    
    return result;
  }
}