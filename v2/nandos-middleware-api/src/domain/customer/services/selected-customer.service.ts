import { CustomerService } from './customer.service';
import { CustomerRepository } from '../repositories/customer.repository';
import { Customer, CustomerEvent } from '../types';

/**
 * Service for a selected customer
 */
export class SelectedCustomerService extends CustomerService {
  private _customerId: string | null = null;
  private _selectedCustomerCache: Promise<Customer> | null = null;
  
  constructor(customerRepository: CustomerRepository) {
    super(customerRepository);
  }
  
  /**
   * Get the customer ID
   * @returns The selected customer ID
   * @throws Error if no customer ID is set
   */
  get customerId(): string {
    if (!this._customerId) {
      throw new Error('No customer ID selected. Call setCustomerId first.');
    }
    return this._customerId;
  }
  
  /**
   * Set the customer ID
   * @param customerId The customer ID to select
   */
  set customerId(customerId: string) {
    const isDifferent = customerId !== this._customerId;
    this._customerId = customerId;
    
    if (isDifferent) {
      this._selectedCustomerCache = null;
      this.notifyObservers('customerChanged', customerId);
    }
  }
  
  /**
   * Get the selected customer
   * @returns Promise resolving to the selected customer
   */
  async getCustomerInfo(): Promise<Customer> {
    if (this._selectedCustomerCache) {
      return this._selectedCustomerCache;
    }
    
    try {
      this._selectedCustomerCache = super.getCustomer();
      return await this._selectedCustomerCache;
    } catch (error) {
      this._selectedCustomerCache = null;
      throw error;
    }
  }
  
  /**
   * Alias for getCustomerInfo
   * @returns Promise resolving to the selected customer
   */
  async getMe(): Promise<Customer> {
    return this.getCustomerInfo();
  }
  
  /**
   * Update the selected customer
   * @param customerData The customer data to update
   * @returns Promise resolving to the updated customer
   */
  async updateCustomer(customerData: Partial<Customer>): Promise<Customer> {
    try {
      this._selectedCustomerCache = super.updateCustomer(customerData);
      return await this._selectedCustomerCache;
    } catch (error) {
      this._selectedCustomerCache = null;
      throw error;
    }
  }
  
  /**
   * Remove a ban from the selected customer
   * @returns Promise resolving to the updated customer
   */
  async removeBan(): Promise<Customer> {
    try {
      this._selectedCustomerCache = super.removeBan();
      return await this._selectedCustomerCache;
    } catch (error) {
      this._selectedCustomerCache = null;
      throw error;
    }
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this._selectedCustomerCache = null;
  }
}