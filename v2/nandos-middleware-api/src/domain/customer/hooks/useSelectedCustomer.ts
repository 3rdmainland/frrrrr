import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { selectedCustomerService } from '../index';
import type { Customer, CustomerAddress, CustomerNote, CustomerEvent } from '../types';
import type { Observer } from '../../../core/utils/observable';

/**
 * Composable hook for working with a selected customer
 * @param initialCustomerId Optional initial customer ID to select
 * @returns Object containing customer data, loading state, error state, and methods to interact with the customer
 */
export function useSelectedCustomer(initialCustomerId?: string) {
  const customer = ref<Customer | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const selectedCustomerId = ref<string | null>(initialCustomerId || null);
  
  // Observer for customer changes
  const customerObserver: Observer<CustomerEvent> = {
    notify: (event: CustomerEvent, data: any) => {
      if (event === 'customerUpdated') {
        customer.value = data;
      } else if (event === 'customerChanged') {
        selectedCustomerId.value = data;
        loadCustomer();
      }
    }
  };
  
  /**
   * Select a customer by ID
   * @param customerId The customer ID to select
   */
  const selectCustomer = (customerId: string) => {
    if (customerId !== selectedCustomerId.value) {
      selectedCustomerId.value = customerId;
      selectedCustomerService.customerId = customerId;
    }
  };
  
  /**
   * Load the selected customer
   */
  const loadCustomer = async () => {
    if (!selectedCustomerId.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      customer.value = await selectedCustomerService.getCustomerInfo();
    } catch (err) {
      error.value = err as Error;
      console.error('Error loading customer:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Update the selected customer
   * @param customerData The customer data to update
   */
  const updateCustomer = async (customerData: Partial<Customer>) => {
    if (!selectedCustomerId.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      customer.value = await selectedCustomerService.updateCustomer(customerData);
    } catch (err) {
      error.value = err as Error;
      console.error('Error updating customer:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Get customer addresses
   * @returns Promise resolving to an array of customer addresses
   */
  const getAddresses = async (): Promise<CustomerAddress[]> => {
    if (!selectedCustomerId.value) return [];
    
    isLoading.value = true;
    error.value = null;
    
    try {
      return await selectedCustomerService.getAddresses();
    } catch (err) {
      error.value = err as Error;
      console.error('Error getting addresses:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Get customer notes
   * @returns Promise resolving to an array of customer notes
   */
  const getNotes = async (): Promise<CustomerNote[]> => {
    if (!selectedCustomerId.value) return [];
    
    isLoading.value = true;
    error.value = null;
    
    try {
      return await selectedCustomerService.getNotes();
    } catch (err) {
      error.value = err as Error;
      console.error('Error getting notes:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Add a customer note
   * @param noteData The note data to add
   * @returns Promise resolving to the added note
   */
  const addNote = async (noteData: Partial<CustomerNote>): Promise<CustomerNote | null> => {
    if (!selectedCustomerId.value) return null;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      return await selectedCustomerService.addNote(noteData);
    } catch (err) {
      error.value = err as Error;
      console.error('Error adding note:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Delete a customer note
   * @param noteId The note ID
   * @returns Promise resolving to a boolean indicating success
   */
  const deleteNote = async (noteId: string): Promise<boolean> => {
    if (!selectedCustomerId.value) return false;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      return await selectedCustomerService.deleteNote(noteId);
    } catch (err) {
      error.value = err as Error;
      console.error('Error deleting note:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Remove a ban from the selected customer
   * @returns Promise resolving to the updated customer
   */
  const removeBan = async (): Promise<Customer | null> => {
    if (!selectedCustomerId.value) return null;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      customer.value = await selectedCustomerService.removeBan();
      return customer.value;
    } catch (err) {
      error.value = err as Error;
      console.error('Error removing ban:', err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Computed properties
  const isAnonymous = computed(() => customer.value?.anonymous || false);
  const isVerified = computed(() => customer.value?.verified || false);
  const isBanned = computed(() => customer.value?.banned || false);
  const fullName = computed(() => customer.value ? `${customer.value.name} ${customer.value.lastName}` : '');
  
  // Watch for changes to selectedCustomerId
  watch(selectedCustomerId, (newId) => {
    if (newId) {
      selectedCustomerService.customerId = newId;
    }
  });
  
  // Add observer on mount
  onMounted(() => {
    selectedCustomerService.addObserver('customerUpdated', customerObserver);
    selectedCustomerService.addObserver('customerChanged', customerObserver);
    
    if (initialCustomerId) {
      selectCustomer(initialCustomerId);
    }
  });
  
  // Remove observer on unmount
  onUnmounted(() => {
    selectedCustomerService.removeObserver('customerUpdated', customerObserver);
    selectedCustomerService.removeObserver('customerChanged', customerObserver);
  });
  
  return {
    customer,
    isLoading,
    error,
    selectedCustomerId,
    isAnonymous,
    isVerified,
    isBanned,
    fullName,
    selectCustomer,
    loadCustomer,
    updateCustomer,
    getAddresses,
    getNotes,
    addNote,
    deleteNote,
    removeBan
  };
}