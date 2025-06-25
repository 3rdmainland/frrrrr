import { ApiClient } from '../../../core/http/api-client';
import { CacheService } from '../../../core/cache/cache-service';
import { 
  Customer, 
  CustomerAddress, 
  CustomerBehavior,
  CustomerNote,
  CustomerPastOrder,
  CustomerPastGiftCardOrder,
  ICustomerCreditCard,
  CustomerGiftCard,
  CustomerWallet
} from '../types';
import { IEntityListResponse, IEntityResponse, IPagedEntityListResponse, TPagedListResponse } from '../../../core/http/types/response';
import filterToQuery, { type TFilterObject } from '../../../util/filter-to-query';

/**
 * Repository for customer data
 */
export class CustomerRepository {
  private cache: CacheService;
  private apiClient: ApiClient;
  
  constructor(apiClient: ApiClient, cache: CacheService) {
    this.apiClient = apiClient;
    this.cache = cache;
  }
  
  /**
   * Get a customer by ID
   * @param customerId The customer ID
   * @returns Promise resolving to the customer
   */
  async getCustomer(customerId: string): Promise<Customer> {
    const cacheKey = `customer:${customerId}`;
    
    // Check cache first
    const cachedCustomer = this.cache.get<Customer>(cacheKey);
    if (cachedCustomer) {
      return cachedCustomer;
    }
    
    // Fetch from API
    const response = await this.apiClient.get<{ customer: Customer }>(`/customers/${customerId}`, { withCredentials: true });
    const customer = response.customer;
    
    // Cache the result
    this.cache.put(cacheKey, customer);
    
    return customer;
  }
  
  /**
   * Update a customer
   * @param customerId The customer ID
   * @param customerData The customer data to update
   * @returns Promise resolving to the updated customer
   */
  async updateCustomer(customerId: string, customerData: Partial<Customer>): Promise<Customer> {
    const response = await this.apiClient.put<{ customer: Customer }>(`/customers/${customerId}`, customerData);
    const customer = response.customer;
    
    // Update cache
    const cacheKey = `customer:${customerId}`;
    this.cache.put(cacheKey, customer);
    
    return customer;
  }
  
  /**
   * Get customer addresses
   * @param customerId The customer ID
   * @returns Promise resolving to an array of customer addresses
   */
  async getAddresses(customerId: string): Promise<CustomerAddress[]> {
    const response = await this.apiClient.get<{ addresses: CustomerAddress[] }>(`/customers/${customerId}/addresses`);
    return response.addresses;
  }
  
  /**
   * Get a customer address
   * @param customerId The customer ID
   * @param addressId The address ID
   * @returns Promise resolving to the customer address
   */
  async getAddress(customerId: string, addressId: string): Promise<CustomerAddress> {
    const response = await this.apiClient.get<{ address: CustomerAddress }>(`/customers/${customerId}/addresses/${addressId}`);
    return response.address;
  }
  
  /**
   * Add a customer address
   * @param customerId The customer ID
   * @param addressData The address data to add
   * @returns Promise resolving to the added address
   */
  async addAddress(customerId: string, addressData: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const response = await this.apiClient.post<{ address: CustomerAddress }>(`/customers/${customerId}/addresses`, addressData);
    return response.address;
  }
  
  /**
   * Update a customer address
   * @param customerId The customer ID
   * @param addressData The address data to update
   * @returns Promise resolving to the updated address
   */
  async updateAddress(customerId: string, addressData: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const response = await this.apiClient.put<{ address: CustomerAddress }>(`/customers/${customerId}/addresses`, addressData);
    return response.address;
  }
  
  /**
   * Delete a customer address
   * @param customerId The customer ID
   * @param addressId The address ID
   * @returns Promise resolving to a boolean indicating success
   */
  async deleteAddress(customerId: string, addressId: string): Promise<boolean> {
    await this.apiClient.delete(`/customers/${customerId}/addresses/${addressId}`);
    return true;
  }
  
  /**
   * Get customer credit cards
   * @param customerId The customer ID
   * @returns Promise resolving to an array of customer credit cards
   */
  async getCreditCards(customerId: string): Promise<ICustomerCreditCard[]> {
    const response = await this.apiClient.get<IEntityListResponse<'cards', ICustomerCreditCard>>(`/customers/${customerId}/cards`);
    return response.data.cards;
  }
  
  /**
   * Add a customer credit card
   * @param customerId The customer ID
   * @param creditCardData The credit card data to add
   * @returns Promise resolving to the added credit card
   */
  async addCreditCard(customerId: string, creditCardData: Partial<ICustomerCreditCard>): Promise<ICustomerCreditCard> {
    const response = await this.apiClient.post<{ transaction: { storableCreditCard: ICustomerCreditCard } }>(`/customers/${customerId}/cards`, { creditCard: creditCardData });
    return response.transaction.storableCreditCard;
  }
  
  /**
   * Delete a customer credit card
   * @param customerId The customer ID
   * @param cardId The credit card ID
   * @returns Promise resolving to a boolean indicating success
   */
  async deleteCreditCard(customerId: string, cardId: string): Promise<boolean> {
    await this.apiClient.delete(`/customers/${customerId}/cards/${cardId}`);
    return true;
  }
  
  /**
   * Get customer behavior data
   * @param customerId The customer ID
   * @returns Promise resolving to an array of customer behaviors
   */
  async getBehaviorData(customerId: string): Promise<CustomerBehavior[]> {
    const response = await this.apiClient.get<{ behaviors: CustomerBehavior[] }>(`/customers/${customerId}/behavior`);
    return response.behaviors;
  }
  
  /**
   * Get customer notes
   * @param customerId The customer ID
   * @returns Promise resolving to an array of customer notes
   */
  async getNotes(customerId: string): Promise<CustomerNote[]> {
    const response = await this.apiClient.get<{ notes: CustomerNote[] }>(`/customers/${customerId}/notes`);
    return response.notes;
  }
  
  /**
   * Get a customer note
   * @param customerId The customer ID
   * @param noteId The note ID
   * @returns Promise resolving to the customer note
   */
  async getNote(customerId: string, noteId: string): Promise<CustomerNote> {
    const response = await this.apiClient.get<{ note: CustomerNote }>(`/customers/${customerId}/notes/${noteId}`);
    return response.note;
  }
  
  /**
   * Add a customer note
   * @param customerId The customer ID
   * @param noteData The note data to add
   * @returns Promise resolving to the added note
   */
  async addNote(customerId: string, noteData: Partial<CustomerNote>): Promise<CustomerNote> {
    const response = await this.apiClient.post<{ note: CustomerNote }>(`/customers/${customerId}/notes`, noteData);
    
    // Clear customer cache as adding a note might change customer status
    const cacheKey = `customer:${customerId}`;
    this.cache.clear(cacheKey);
    
    return response.note;
  }
  
  /**
   * Delete a customer note
   * @param customerId The customer ID
   * @param noteId The note ID
   * @returns Promise resolving to a boolean indicating success
   */
  async deleteNote(customerId: string, noteId: string): Promise<boolean> {
    const response = await this.apiClient.delete<{ status: string }>(`/customers/${customerId}/notes/${noteId}`);
    
    // Clear customer cache as removing a note might change customer status
    const cacheKey = `customer:${customerId}`;
    this.cache.clear(cacheKey);
    
    return response.status === 'success';
  }
  
  /**
   * Get customer food orders
   * @param customerId The customer ID
   * @returns Promise resolving to an array of customer past orders
   */
  async getFoodOrders(customerId: string): Promise<CustomerPastOrder[]> {
    const response = await this.apiClient.get<{ baskets: CustomerPastOrder[] }>(`/customers/${customerId}/basket/history`);
    return response.baskets;
  }
  
  /**
   * Get a customer food order
   * @param customerId The customer ID
   * @param orderId The order ID
   * @returns Promise resolving to the customer past order
   */
  async getFoodOrder(customerId: string, orderId: string): Promise<CustomerPastOrder> {
    const response = await this.apiClient.get<{ basket: CustomerPastOrder }>(`/customers/${customerId}/basket/history/${orderId}`);
    return response.basket;
  }
  
  /**
   * Get a food order invoice
   * @param customerId The customer ID
   * @param orderId The order ID
   * @param email The email to send the invoice to
   * @returns Promise resolving to a boolean indicating success
   */
  async getFoodOrderInvoice(customerId: string, orderId: string, email: string): Promise<boolean> {
    const response = await this.apiClient.post<{ status: string }>(`/customers/${customerId}/basket/history/${orderId}/invoice`, { email });
    return response.status === 'success';
  }
  
  /**
   * Get a customer wallet
   * @param customerId The customer ID
   * @returns Promise resolving to customer wallet
   */
  async getWallet(customerId: string): Promise<CustomerWallet> {
    const response = await this.apiClient.get<IEntityResponse<'wallet', CustomerWallet>>(`/customers/${customerId}/wallet`)
    return response.data.wallet;
  }
  
  /**
   * Get customer ordered gift cards
   * @param customerId  The customer ID
   * @param pageNumber The page number of the list
   * @param pageSize The number of data items per page
   * @param filters A key value object to filter the data by
   * @returns Promise resolving to an array of customer ordered gift cards as well as pagination information
   */
  async getGiftCards(customerId: string, filters: TFilterObject, pageNumber: number, pageSize: number): Promise<TPagedListResponse<"giftcards", CustomerGiftCard[]>> {
    const response = await this.apiClient.get<IPagedEntityListResponse<'giftcards', CustomerGiftCard>>(`/customers/${customerId}/giftcards?pageNumber=${pageNumber}&pageSize=${pageSize}&${filterToQuery(filters)}`);
    return response.data;
  }

  /**
   * Get customer gift card orders
   * @param customerId The customer ID
   * @returns Promise resolving to an array of customer past gift card orders
   */
  async getGiftCardOrders(customerId: string): Promise<CustomerPastGiftCardOrder[]> {
    const response = await this.apiClient.get<{ baskets: CustomerPastGiftCardOrder[] }>(`/customers/${customerId}/giftcardbasket/history`);
    return response.baskets;
  }
  
  /**
   * Get a customer gift card order
   * @param customerId The customer ID
   * @param orderId The order ID
   * @returns Promise resolving to the customer past gift card order
   */
  async getGiftCardOrder(customerId: string, orderId: string): Promise<CustomerPastGiftCardOrder> {
    const response = await this.apiClient.get<{ basket: CustomerPastGiftCardOrder }>(`/customers/${customerId}/giftcardbasket/history/${orderId}`);
    return response.basket;
  }
  
  /**
   * Get a gift card order invoice
   * @param customerId The customer ID
   * @param orderId The order ID
   * @param email The email to send the invoice to
   * @returns Promise resolving to a boolean indicating success
   */
  async getGiftCardOrderInvoice(customerId: string, orderId: string, email: string): Promise<boolean> {
    const response = await this.apiClient.post<{ status: string }>(`/customers/${customerId}/giftcardbasket/history/${orderId}/invoice`, { email });
    return response.status === 'success';
  }
  
  /**
   * Resend a gift card email
   * @param customerId The customer ID
   * @param orderId The order ID
   * @param cardId The card ID
   * @param email The email to send the gift card to
   * @returns Promise resolving to a boolean indicating success
   */
  async resendGiftCardEmail(customerId: string, orderId: string, cardId: string, email: string): Promise<boolean> {
    const response = await this.apiClient.post<{ status: string }>(`/customers/${customerId}/giftcardbasket/history/${orderId}/resend`, { cardId, email });
    return response.status === 'success';
  }
  
  /**
   * Update customer language preference
   * @param customerId The customer ID
   * @param language The language preference
   * @returns Promise resolving to the updated customer
   */
  async updateLanguagePreference(customerId: string, language: string): Promise<Customer> {
    const response = await this.apiClient.put<{ customer: Customer }>(`/customers/${customerId}/language/${language}`);
    const customer = response.customer;
    
    // Update cache
    const cacheKey = `customer:${customerId}`;
    this.cache.put(cacheKey, customer);
    
    return customer;
  }
  
  /**
   * Remove a customer ban
   * @param customerId The customer ID
   * @returns Promise resolving to the updated customer
   */
  async removeBan(customerId: string): Promise<Customer> {
    const response = await this.apiClient.delete<{ customer: Customer }>(`/customers/${customerId}/blacklist`);
    const customer = response.customer;
    
    // Update cache
    const cacheKey = `customer:${customerId}`;
    this.cache.put(cacheKey, customer);
    
    return customer;
  }
  
  /**
   * Clear the cache for a customer
   * @param customerId The customer ID to clear the cache for
   */
  clearCache(customerId?: string): void {
    if (customerId) {
      this.cache.clear(`customer:${customerId}`);
    } else {
      this.cache.clearPattern('customer:*');
    }
  }
}