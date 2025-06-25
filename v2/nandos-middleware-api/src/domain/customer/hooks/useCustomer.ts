import { ref, computed, onMounted, onUnmounted } from 'vue';
import { meService } from '../index';
import type { Customer, CustomerAddress, CustomerEvent, CustomerGiftCard, CustomerWallet } from '../types';
import type { Observer } from '../../../core/utils/observable';
import type CustomerCreditCard from '../../../model/customer-credit-card';
import type {TFilterObject } from '../../../util/filter-to-query';
import type { TPagedListResponse } from '../../../core/http/types/response';

/**
 * Composable hook for working with the current customer
 * @returns Object containing customer data, loading state, error state, and methods to interact with the customer
 */
export function useCustomer() {
  const customer = ref<Customer | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  
  // Observer for customer changes
  const customerObserver: Observer<CustomerEvent> = {
    notify: (event: CustomerEvent, updatedCustomer: Customer) => {
      if (event === 'customerUpdated') {
        customer.value = updatedCustomer;
      }
    }
  };
  
  /**
   * Load the current customer
   */
  const loadCustomer = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      customer.value = await meService.getMe();
    } catch (err) {
      error.value = err as Error;
      console.error('Error loading customer:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Update the current customer
   * @param customerData The customer data to update
   */
  const updateCustomer = async (customerData: Partial<Customer>) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      customer.value = await meService.updateCustomer(customerData);
    } catch (err) {
      error.value = err as Error;
      console.error('Error updating customer:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Update the customer's language preference
   * @param language The language preference
   */
  const updateLanguagePreference = async (language: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      customer.value = await meService.updateLanguagePreference(language);
    } catch (err) {
      error.value = err as Error;
      console.error('Error updating language preference:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Get customer addresses
   * @returns Promise resolving to an array of customer addresses
   */
  const getAddresses = async (): Promise<CustomerAddress[]> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      return await meService.getAddresses();
    } catch (err) {
      error.value = err as Error;
      console.error('Error getting addresses:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Add a customer address
   * @param addressData The address data to add
   * @returns Promise resolving to the added address
   */
  const addAddress = async (addressData: Partial<CustomerAddress>): Promise<CustomerAddress | null> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      return await meService.addAddress(addressData);
    } catch (err) {
      error.value = err as Error;
      console.error('Error adding address:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Update a customer address
   * @param addressData The address data to update
   * @returns Promise resolving to the updated address
   */
  const updateAddress = async (addressData: Partial<CustomerAddress>): Promise<CustomerAddress | null> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      return await meService.updateAddress(addressData);
    } catch (err) {
      error.value = err as Error;
      console.error('Error updating address:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Delete a customer address
   * @param addressId The address ID
   * @returns Promise resolving to a boolean indicating success
   */
  const deleteAddress = async (addressId: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      return await meService.deleteAddress(addressId);
    } catch (err) {
      error.value = err as Error;
      console.error('Error deleting address:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Get customer credit cards
   * @returns Promise resolving to an array of customer credit cards
   */
  const getCreditCards = async (): Promise<CustomerCreditCard[]> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      return await meService.getCreditCards();
    } catch (err) {
      error.value = err as Error;
      console.error('Error getting credit cards:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Add a customer credit card
   * @param creditCardData The credit card data to add
   * @returns Promise resolving to the added credit card
   */
  const addCreditCard = async (creditCardData: Partial<CustomerCreditCard>): Promise<CustomerCreditCard | null> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      return await meService.addCreditCard(creditCardData);
    } catch (err) {
      error.value = err as Error;
      console.error('Error adding credit card:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Delete a customer credit card
   * @param cardId The credit card ID
   * @returns Promise resolving to a boolean indicating success
   */
  const deleteCreditCard = async (cardId: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      return await meService.deleteCreditCard(cardId);
    } catch (err) {
      error.value = err as Error;
      console.error('Error deleting credit card:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get customer ordered gift cards
   * @param {number} pageNumber The page number of the list
   * @param {number} pageSize The number of data items per page
   * @param {TFilterObject} filters A key value object to filter the data by
   * @returns Promise resolving to an array of customer ordered gift cards as well as pagination information or false (indicates error)
   */
  const getGiftCards = async (filters: TFilterObject = {}, pageNumber: number = 0, pageSize: number = 10): Promise<TPagedListResponse<"giftcards", CustomerGiftCard[]> | null> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      return await meService.getGiftCards(filters, pageNumber, pageSize);
    } catch (err) {
      error.value = err as Error;
      console.error('Error fetching gift cards:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
	}

  /**
   * Get a customer wallet
   * @returns Promise resolving to customer wallet or null
   */
  const getWallet = async (): Promise<CustomerWallet | null> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      return await meService.getWallet();
    } catch (err) {
      error.value = err as Error;
      console.error('Error fetching customer wallet:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Computed properties
  const isAnonymous = computed(() => customer.value?.anonymous || false);
  const isVerified = computed(() => customer.value?.verified || false);
  const fullName = computed(() => customer.value ? `${customer.value.name} ${customer.value.lastName}` : '');
  
  // Add observer on mount
  onMounted(() => {
    meService.addObserver('customerUpdated', customerObserver);
    loadCustomer();
  });
  
  // Remove observer on unmount
  onUnmounted(() => {
    meService.removeObserver('customerUpdated', customerObserver);
  });
  
  return {
    customer,
    isLoading,
    error,
    isAnonymous,
    isVerified,
    fullName,
    loadCustomer,
    updateCustomer,
    updateLanguagePreference,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    getCreditCards,
    addCreditCard,
    deleteCreditCard,
    getGiftCards,
    getWallet
  };
}