import { ref, computed, onMounted, onUnmounted } from 'vue';
import { basketService } from '../index';
import type { Basket, BasketItem, BasketEvent } from '../types';
import type { Observer } from '../../../core/utils/observable';
import type UserProduct from '../../../model/user-product';

/**
 * Composable hook for working with the basket
 * @returns Object containing basket data and methods to interact with the basket
 */
export function useMyBasket() {
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

    // Refresh the basket
    basketService.refreshBasket().then(updatedBasket => {
      basket.value = updatedBasket;
    });
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
  const addItem = async (item: BasketItem) => {
    basket.value = await basketService.addItem(item);
  };

  /**
   * Add a product to the basket
   * @param product The product to add
   * @param quantity The quantity to add
   */
  const addProduct = async (product: UserProduct, quantity = 1) => {
    basket.value = await basketService.addProduct(product, quantity);
  };

  /**
   * Add multiple products to the basket
   * @param products Array of products to add
   */
  const addProducts = async (products: UserProduct[]) => {
    basket.value = await basketService.addProducts(products);
  };

  /**
   * Remove an item from the basket
   * @param itemId The ID of the item to remove
   */
  const removeItem = async (itemId: string) => {
    basket.value = await basketService.removeItem(itemId);
  };

  /**
   * Update the quantity of an item in the basket
   * @param itemId The ID of the item to update
   * @param quantity The new quantity
   */
  const updateItemQuantity = async (itemId: string, quantity: number) => {
    basket.value = await basketService.updateItemQuantity(itemId, quantity);
  };

  /**
   * Configure the order
   * @param data Order configuration data
   */
  const configureOrder = async (data: any) => {
    basket.value = await basketService.configureOrder(data);
  };

  /**
   * Clear the basket
   */
  const clearBasket = async () => {
    basket.value = await basketService.clearBasket();
  };

  /**
   * Refresh the basket
   */
  const refreshBasket = async () => {
    basket.value = await basketService.refreshBasket();
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
    addProducts,
    removeItem,
    updateItemQuantity,
    configureOrder,
    clearBasket,
    refreshBasket
  };
}