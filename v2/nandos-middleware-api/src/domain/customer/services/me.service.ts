import { CustomerService } from './customer.service';
import { CustomerRepository } from '../repositories/customer.repository';
import { Customer } from '../types';
import { ApiClient } from '../../../core/http/api-client';

/**
 * Service for the current customer
 */
export class MeService extends CustomerService {
  private _meCache: Promise<Customer> | null = null;
  
  constructor(customerRepository: CustomerRepository, private apiClient: ApiClient) {
    super(customerRepository);
  }
  
  /**
   * Get the customer ID
   * @returns The customer ID for the current user
   */
  get customerId(): string {
    return 'me';
  }
  
  /**
   * Get the current customer
   * @returns Promise resolving to the current customer
   */
  async getMe(): Promise<Customer> {
    if (this._meCache) {
      return this._meCache;
    }
    
    try {
      this._meCache = this.getCustomer();
      return await this._meCache;
    } catch (error) {
      this._meCache = null;
      throw error;
    }
  }
  
  /**
   * Check if the current customer is anonymous
   * @returns Promise resolving to a boolean indicating if the customer is anonymous
   */
  async isAnonymous(): Promise<boolean> {
    const customer = await this.getMe();
    return customer.anonymous;
  }
  
  /**
   * Check if the current customer is verified
   * @returns Promise resolving to a boolean indicating if the customer is verified
   */
  async isVerified(): Promise<boolean> {
    const customer = await this.getMe();
    return customer.verified;
  }
  
  /**
   * Update the current customer
   * @param customerData The customer data to update
   * @returns Promise resolving to the updated customer
   */
  async updateCustomer(customerData: Partial<Customer>): Promise<Customer> {
    try {
      this._meCache = super.updateCustomer(customerData);
      return await this._meCache;
    } catch (error) {
      this._meCache = null;
      throw error;
    }
  }
  
  /**
   * Update the current customer's language preference
   * @param language The language preference
   * @returns Promise resolving to the updated customer
   */
  async updateLanguagePreference(language: string): Promise<Customer> {
    try {
      this._meCache = super.updateLanguagePreference(language);
      return await this._meCache;
    } catch (error) {
      this._meCache = null;
      throw error;
    }
  }
  
  /**
   * Get in-flight transactions
   * @returns Promise resolving to the in-flight transactions
   */
  async getInFlightTransactions(): Promise<any> {
    const response = await this.apiClient.get<{ transaction: any }>('/modules/payment/inflight');
    return response.transaction;
  }
  
  /**
   * Acknowledge a transaction
   * @param transaction The transaction to acknowledge
   * @returns Promise resolving to a boolean indicating success
   */
  async acknowledgeTransaction(transaction: { serviceType: string; orderId: string }): Promise<boolean> {
    const response = await this.apiClient.post<{ status: string }>(
      `/modules/payment/inflight/acknowledge/${transaction.serviceType.toLowerCase()}/${transaction.orderId}`
    );
    return response.status === 'success';
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this._meCache = null;
  }
}