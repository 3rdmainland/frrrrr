// /domain/basket/services/basket.service.ts

import { Observable } from '../../../core/utils/observable';
import { v4 as uuidv4 } from 'uuid';
import type { Basket, BasketItem, BasketEvent, OrderConfiguration } from '../types';
import type UserProduct from '../../../model/user-product';
import { BasketRepository, basketRepository } from '../repository/basket.repository';

/**
 * Service for managing the basket
 */
export class BasketService extends Observable<BasketEvent> {
  private basketRepository: BasketRepository;
  private basket: Basket;

  constructor(basketRepository: BasketRepository) {
    super();
    this.basketRepository = basketRepository;
    this.basket = this.createEmptyBasket();
    this.initializeBasket();
  }

  /**
   * Initialize the basket from the repository
   */
  private async initializeBasket(): Promise<void> {
    try {
      // If a customer ID is set, fetch the basket
      if (this.basketRepository.getCustomerId()) {
        this.basket = await this.basketRepository.getBasket();
      }
    } catch (error) {
      console.error('Error initializing basket:', error);
    }
  }

  /**
   * Set the customer ID for basket operations
   * @param customerId The customer ID
   */
  setCustomerId(customerId: string): void {
    this.basketRepository.setCustomerId(customerId);
    this.initializeBasket();
  }

  /**
   * Get the current basket
   * @returns The current basket
   */
  getBasket(): Basket {
    return { ...this.basket };
  }

  /**
   * Refresh the basket from the repository
   * @returns Promise resolving to the refreshed basket
   */
  async refreshBasket(): Promise<Basket> {
    try {
      this.basket = await this.basketRepository.getBasket();
      return this.getBasket();
    } catch (error) {
      console.error('Error refreshing basket:', error);
      return this.getBasket();
    }
  }

  /**
   * Get the basket summary
   * @returns Promise resolving to the basket summary
   */
  async getBasketSummary(): Promise<Basket> {
    try {
      return await this.basketRepository.getBasketSummary();
    } catch (error) {
      console.error('Error getting basket summary:', error);
      return this.getBasket();
    }
  }

  /**
   * Add an item to the basket
   * @param item The item to add
   * @returns Promise resolving to the updated basket
   */
  async addItem(item: BasketItem): Promise<Basket> {
    // Generate an ID if not provided
    if (!item.id) {
      item = { ...item, id: uuidv4() };
    }

    try {
      // Check if the item already exists
      const existingItemIndex = this.basket.items.findIndex(i => i.id === item.id);

      if (existingItemIndex >= 0) {
        // Update existing item
        this.basket = await this.basketRepository.updateItem(item.id, item);
        this.notifyObservers('basketItemUpdated', this.basket, item);
      } else {
        // Add new item
        this.basket = await this.basketRepository.addItem(item);
        this.notifyObservers('basketItemAdded', this.basket, item);
      }

      return this.getBasket();
    } catch (error) {
      console.error('Error adding item to basket:', error);
      return this.getBasket();
    }
  }

  /**
   * Add a product to the basket
   * @param product The product to add
   * @param quantity The quantity to add
   * @returns Promise resolving to the updated basket
   */
  async addProduct(product: UserProduct, quantity = 1): Promise<Basket> {
    try {
      this.basket = await this.basketRepository.addProduct(product, quantity);

      // Find the added item to notify observers
      const addedItem = this.basket.items.find(item => item.productId === product.product.id);

      if (addedItem) {
        this.notifyObservers('basketItemAdded', this.basket, addedItem);
      }

      return this.getBasket();
    } catch (error) {
      console.error('Error adding product to basket:', error);
      return this.getBasket();
    }
  }

  /**
   * Add multiple products to the basket
   * @param products Array of products to add
   * @returns Promise resolving to the updated basket
   */
  async addProducts(products: UserProduct[]): Promise<Basket> {
    try {
      this.basket = await this.basketRepository.addProducts(products);
      this.notifyObservers('basketChanged', this.basket);
      return this.getBasket();
    } catch (error) {
      console.error('Error adding products to basket:', error);
      return this.getBasket();
    }
  }

  /**
   * Remove an item from the basket
   * @param itemId The ID of the item to remove
   * @returns Promise resolving to the updated basket
   */
  async removeItem(itemId: string): Promise<Basket> {
    try {
      // Find the item before removing it
      const item = this.basket.items.find(i => i.id === itemId);

      if (item) {
        this.basket = await this.basketRepository.removeItem(itemId);
        this.notifyObservers('basketItemRemoved', this.basket, item);
      }

      return this.getBasket();
    } catch (error) {
      console.error('Error removing item from basket:', error);
      return this.getBasket();
    }
  }

  /**
   * Update the quantity of an item in the basket
   * @param itemId The ID of the item to update
   * @param quantity The new quantity
   * @returns Promise resolving to the updated basket
   */
  async updateItemQuantity(itemId: string, quantity: number): Promise<Basket> {
    try {
      if (quantity <= 0) {
        return this.removeItem(itemId);
      }

      const itemIndex = this.basket.items.findIndex(i => i.id === itemId);

      if (itemIndex >= 0) {
        const updatedItem = {
          ...this.basket.items[itemIndex],
          quantity
        };

        this.basket = await this.basketRepository.updateItem(itemId, updatedItem);
        this.notifyObservers('basketItemUpdated', this.basket, updatedItem);
      }

      return this.getBasket();
    } catch (error) {
      console.error('Error updating item quantity:', error);
      return this.getBasket();
    }
  }

  /**
   * Configure the order
   * @param data Order configuration data
   * @returns Promise resolving to the updated basket
   */
  async configureOrder(data: OrderConfiguration): Promise<Basket> {
    try {
      this.basket = await this.basketRepository.configureOrder(data);
      this.notifyObservers('basketChanged', this.basket);
      return this.getBasket();
    } catch (error) {
      console.error('Error configuring order:', error);
      return this.getBasket();
    }
  }

  /**
   * Set driver tip
   * @param amount The tip amount
   * @returns Promise resolving to the updated basket
   */
  async setDriverTip(amount: number): Promise<Basket> {
    try {
      this.basket = await this.basketRepository.setDriverTip(amount);
      this.notifyObservers('basketChanged', this.basket);
      return this.getBasket();
    } catch (error) {
      console.error('Error setting driver tip:', error);
      return this.getBasket();
    }
  }

  /**
   * Clear the basket
   * @returns Promise resolving to the empty basket
   */
  async clearBasket(): Promise<Basket> {
    try {
      this.basket = await this.basketRepository.clearBasket();
      this.notifyObservers('basketCleared', this.basket);
      return this.getBasket();
    } catch (error) {
      console.error('Error clearing basket:', error);
      return this.getBasket();
    }
  }

  /**
   * Create an empty basket
   * @returns An empty basket
   */
  private createEmptyBasket(): Basket {
    return {
      id: uuidv4(),
      items: [],
      total: 0,
      subtotal: 0
    };
  }
}

// Create a singleton instance
export const basketService = new BasketService(basketRepository);