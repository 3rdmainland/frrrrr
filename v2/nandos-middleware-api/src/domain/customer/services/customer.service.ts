import CustomerCreditCard from 'src/model/customer-credit-card';
import { Observable } from '../../../core/utils/observable';
import { CustomerRepository } from '../repositories/customer.repository';
import type { 
  Customer, 
  CustomerAddress, 
  ICustomerCreditCard, 
  CustomerBehavior,
  CustomerNote,
  CustomerPastOrder,
  CustomerPastGiftCardOrder,
  CustomerEvent,
  CustomerGiftCard,
  CustomerWallet
} from '../types';
import { type TPagedListResponse } from '../../../core/http/types/response';
import { type TFilterObject } from '../../../util/filter-to-query';

/**
 * Base service for customer operations
 */
export abstract class CustomerService extends Observable<CustomerEvent> {
  constructor(protected customerRepository: CustomerRepository) {
    super();
  }
  
  /**
   * Get the customer ID
   * This method must be implemented by child classes
   */
  abstract get customerId(): string;
  
  /**
   * Get customer information
   * @returns Promise resolving to the customer
   */
  async getCustomer(): Promise<Customer> {
    const customer = await this.customerRepository.getCustomer(this.customerId);
    return customer;
  }
  
  /**
   * Update customer information
   * @param customerData The customer data to update
   * @returns Promise resolving to the updated customer
   */
  async updateCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const customer = await this.customerRepository.updateCustomer(this.customerId, customerData);
    this.notifyObservers('customerUpdated', customer);
    return customer;
  }
  
  /**
   * Get customer addresses
   * @returns Promise resolving to an array of customer addresses
   */
  async getAddresses(): Promise<CustomerAddress[]> {
    return this.customerRepository.getAddresses(this.customerId);
  }
  
  /**
   * Get a customer address
   * @param addressId The address ID
   * @returns Promise resolving to the customer address
   */
  async getAddress(addressId: string): Promise<CustomerAddress> {
    return this.customerRepository.getAddress(this.customerId, addressId);
  }
  
  /**
   * Add a customer address
   * @param addressData The address data to add
   * @returns Promise resolving to the added address
   */
  async addAddress(addressData: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const address = await this.customerRepository.addAddress(this.customerId, addressData);
    this.notifyObservers('customerUpdated', await this.getCustomer());
    return address;
  }
  
  /**
   * Update a customer address
   * @param addressData The address data to update
   * @returns Promise resolving to the updated address
   */
  async updateAddress(addressData: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const address = await this.customerRepository.updateAddress(this.customerId, addressData);
    this.notifyObservers('customerUpdated', await this.getCustomer());
    return address;
  }
  
  /**
   * Delete a customer address
   * @param addressId The address ID
   * @returns Promise resolving to a boolean indicating success
   */
  async deleteAddress(addressId: string): Promise<boolean> {
    const result = await this.customerRepository.deleteAddress(this.customerId, addressId);
    this.notifyObservers('customerUpdated', await this.getCustomer());
    return result;
  }
  
  /**
   * Get customer credit cards
   * @returns Promise resolving to an array of customer credit cards
   */
  async getCreditCards(): Promise<CustomerCreditCard[]> {
    const cards = await this.customerRepository.getCreditCards(this.customerId);
    return cards.map(c => new CustomerCreditCard(c));
  }
  
  /**
   * Add a customer credit card
   * @param creditCardData The credit card data to add
   * @returns Promise resolving to the added credit card
   */
  async addCreditCard(creditCardData: Partial<CustomerCreditCard>): Promise<CustomerCreditCard> {
    const creditCard = await this.customerRepository.addCreditCard(this.customerId, creditCardData);
    this.notifyObservers('customerUpdated', await this.getCustomer());
    return new CustomerCreditCard(creditCard);
  }
  
  /**
   * Delete a customer credit card
   * @param cardId The credit card ID
   * @returns Promise resolving to a boolean indicating success
   */
  async deleteCreditCard(cardId: string): Promise<boolean> {
    const result = await this.customerRepository.deleteCreditCard(this.customerId, cardId);
    this.notifyObservers('customerUpdated', await this.getCustomer());
    return result;
  }
  
  /**
   * Get customer behavior data
   * @returns Promise resolving to an array of customer behaviors
   */
  async getBehaviorData(): Promise<CustomerBehavior[]> {
    return this.customerRepository.getBehaviorData(this.customerId);
  }
  
  /**
   * Get customer notes
   * @returns Promise resolving to an array of customer notes
   */
  async getNotes(): Promise<CustomerNote[]> {
    return this.customerRepository.getNotes(this.customerId);
  }
  
  /**
   * Get a customer note
   * @param noteId The note ID
   * @returns Promise resolving to the customer note
   */
  async getNote(noteId: string): Promise<CustomerNote> {
    return this.customerRepository.getNote(this.customerId, noteId);
  }
  
  /**
   * Add a customer note
   * @param noteData The note data to add
   * @returns Promise resolving to the added note
   */
  async addNote(noteData: Partial<CustomerNote>): Promise<CustomerNote> {
    const note = await this.customerRepository.addNote(this.customerId, noteData);
    this.notifyObservers('customerUpdated', await this.getCustomer());
    return note;
  }
  
  /**
   * Delete a customer note
   * @param noteId The note ID
   * @returns Promise resolving to a boolean indicating success
   */
  async deleteNote(noteId: string): Promise<boolean> {
    const result = await this.customerRepository.deleteNote(this.customerId, noteId);
    this.notifyObservers('customerUpdated', await this.getCustomer());
    return result;
  }
  
  /**
   * Get customer food orders
   * @returns Promise resolving to an array of customer past orders
   */
  async getFoodOrders(): Promise<CustomerPastOrder[]> {
    return this.customerRepository.getFoodOrders(this.customerId);
  }
  
  /**
   * Get a customer food order
   * @param orderId The order ID
   * @returns Promise resolving to the customer past order
   */
  async getFoodOrder(orderId: string): Promise<CustomerPastOrder> {
    return this.customerRepository.getFoodOrder(this.customerId, orderId);
  }
  
  /**
   * Get a food order invoice
   * @param orderId The order ID
   * @param email The email to send the invoice to
   * @returns Promise resolving to a boolean indicating success
   */
  async getFoodOrderInvoice(orderId: string, email: string): Promise<boolean> {
    return this.customerRepository.getFoodOrderInvoice(this.customerId, orderId, email);
  }

  /**
   * Get a customer wallet
   * @param customerId The customer ID
   * @returns Promise resolving to customer wallet
   */
  async getWallet(): Promise<CustomerWallet> {
    return this.customerRepository.getWallet(this.customerId);
  }

  /**
   * Get customer ordered gift cards
   * @param {number} pageNumber The page number of the list
   * @param {number} pageSize The number of data items per page
   * @param {TFilterObject} filters A key value object to filter the data by
   * @returns Promise resolving to an array of customer ordered gift cards as well as pagination information
   */
  async getGiftCards(filters: TFilterObject, pageNumber: number, pageSize: number): Promise<TPagedListResponse<"giftcards", CustomerGiftCard[]>> {
    return this.customerRepository.getGiftCards(this.customerId, filters, pageNumber, pageSize);
  }
  
  /**
   * Get customer gift card orders
   * @returns Promise resolving to an array of customer past gift card orders
   */
  async getGiftCardOrders(): Promise<CustomerPastGiftCardOrder[]> {
    return this.customerRepository.getGiftCardOrders(this.customerId);
  }
  
  /**
   * Get a customer gift card order
   * @param orderId The order ID
   * @returns Promise resolving to the customer past gift card order
   */
  async getGiftCardOrder(orderId: string): Promise<CustomerPastGiftCardOrder> {
    return this.customerRepository.getGiftCardOrder(this.customerId, orderId);
  }
  
  /**
   * Get a gift card order invoice
   * @param orderId The order ID
   * @param email The email to send the invoice to
   * @returns Promise resolving to a boolean indicating success
   */
  async getGiftCardOrderInvoice(orderId: string, email: string): Promise<boolean> {
    return this.customerRepository.getGiftCardOrderInvoice(this.customerId, orderId, email);
  }
  
  /**
   * Resend a gift card email
   * @param orderId The order ID
   * @param cardId The card ID
   * @param email The email to send the gift card to
   * @returns Promise resolving to a boolean indicating success
   */
  async resendGiftCardEmail(orderId: string, cardId: string, email: string): Promise<boolean> {
    return this.customerRepository.resendGiftCardEmail(this.customerId, orderId, cardId, email);
  }
  
  /**
   * Update customer language preference
   * @param language The language preference
   * @returns Promise resolving to the updated customer
   */
  async updateLanguagePreference(language: string): Promise<Customer> {
    const customer = await this.customerRepository.updateLanguagePreference(this.customerId, language);
    this.notifyObservers('customerUpdated', customer);
    return customer;
  }
  
  /**
   * Remove a customer ban
   * @returns Promise resolving to the updated customer
   */
  async removeBan(): Promise<Customer> {
    const customer = await this.customerRepository.removeBan(this.customerId);
    this.notifyObservers('customerUpdated', customer);
    return customer;
  }
}