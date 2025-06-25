import { ref, computed, onMounted, onUnmounted } from 'vue';
import { basketService } from '../index';
import type { Basket, BasketItem, BasketEvent } from '../types';
import type { Observer } from '../../../core/utils/observable';
import type UserProduct from '../../../model/user-product';

/**
 * Composable hook for working with the basket
 * @returns Object containing basket data and methods to interact with the basket
 */
export function useBasket() {
  const basket = ref<Basket>(basketService.getBasket());

  // Computed properties
  const items = computed(() => basket.value.items);
  const total = computed(() => basket.value.total);
  const subtotal = computed(() => basket.value.subtotal);
  const itemCount = computed(() => basket.value.items.reduce((count, item) => count + item.quantity, 0));
  const isEmpty = computed(() => basket.value.items.length === 0);

  // Observer for basket changes
  const basketObserver: Observer<BasketEvent> = {
    notify: (event: BasketEvent, updatedBasket: Basket) => {
      basket.value = { ...updatedBasket };
    }
  };

  // Add observer on mount
  onMounted(() => {
    basketService.addObserver('basketChanged', basketObserver);
    basketService.addObserver('basketCleared', basketObserver);
    basketService.addObserver('basketItemAdded', basketObserver);
    basketService.addObserver('basketItemRemoved', basketObserver);
    basketService.addObserver('basketItemUpdated', basketObserver);
  });

  // Remove observer on unmount
  onUnmounted(() => {
    basketService.removeObserver('basketChanged', basketObserver);
    basketService.removeObserver('basketCleared', basketObserver);
    basketService.removeObserver('basketItemAdded', basketObserver);
    basketService.removeObserver('basketItemRemoved', basketObserver);
    basketService.removeObserver('basketItemUpdated', basketObserver);
  });

  /**
   * Add an item to the basket
   * @param item The item to add
   */
  const addItem = (item: BasketItem) => {
    basket.value = basketService.addItem(item);
  };

  /**
   * Add a product to the basket
   * @param product The product to add
   * @param quantity The quantity to add
   */
  const addProduct = (product: UserProduct, quantity = 1) => {
    basket.value = basketService.addProduct(product, quantity);
  };

  /**
   * Remove an item from the basket
   * @param itemId The ID of the item to remove
   */
  const removeItem = (itemId: string) => {
    basket.value = basketService.removeItem(itemId);
  };

  /**
   * Update the quantity of an item in the basket
   * @param itemId The ID of the item to update
   * @param quantity The new quantity
   */
  const updateItemQuantity = (itemId: string, quantity: number) => {
    basket.value = basketService.updateItemQuantity(itemId, quantity);
  };

  /**
   * Clear the basket
   */
  const clearBasket = () => {
    basket.value = basketService.clearBasket();
  };

  return {
    basket,
    items,
    total,
    subtotal,
    itemCount,
    isEmpty,
    addItem,
    addProduct,
    removeItem,
    updateItemQuantity,
    clearBasket
  };
}