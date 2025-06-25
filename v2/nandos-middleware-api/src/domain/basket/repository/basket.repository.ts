import { ApiClient } from '../../../core/http/api-client';
import { CacheService } from '../../../core/cache/cache-service';
import { Basket, BasketItem, OrderConfiguration } from '../types';
import { v4 as uuidv4 } from 'uuid';
import type UserProduct from '../../../model/user-product';

/**
 * Repository for basket data
 */
export class BasketRepository {
  private apiClient: ApiClient;
  private cache: CacheService;
  private customerId: string | null = null;

  constructor(apiClient: ApiClient, cache: CacheService) {
    this.apiClient = apiClient;
    this.cache = cache;
  }

  /**
   * Set the customer ID for basket operations
   * @param customerId The customer ID
   */
  setCustomerId(customerId: string): void {
    this.customerId = customerId;
    this.clearCache();
  }

  /**
   * Get the current customer ID
   * @returns The customer ID or null if not set
   */
  getCustomerId(): string | null {
    return this.customerId;
  }

  /**
   * Get the current basket
   * @returns Promise resolving to the basket
   */
  async getBasket(): Promise<Basket> {
    if (!this.customerId) {
      return this.createEmptyBasket();
    }

    const cacheKey = `basket:${this.customerId}`;

    // Check cache first
    const cachedBasket = this.cache.get<Basket>(cacheKey);
    if (cachedBasket) {
      return { ...cachedBasket };
    }

    try {
      // Fetch from API
      const response = await this.apiClient.get<{ basket: Basket }>(`/customers/${this.customerId}/basket`);
      const basket = response.data.basket;

      // Cache the result
      this.cache.put(cacheKey, basket);

      return { ...basket };
    } catch (error) {
      console.error('Error fetching basket:', error);
      return this.createEmptyBasket();
    }
  }

  /**
   * Get a basket summary
   * @returns Promise resolving to the basket summary
   */
  async getBasketSummary(): Promise<Basket> {
    if (!this.customerId) {
      return this.createEmptyBasket();
    }

    const cacheKey = `basket-summary:${this.customerId}`;

    // Check cache first
    const cachedSummary = this.cache.get<Basket>(cacheKey);
    if (cachedSummary) {
      return { ...cachedSummary };
    }

    try {
      // Fetch from API
      const response = await this.apiClient.get<{ basket: Basket }>(`/customers/${this.customerId}/basket/summary`);
      const summary = response.data.basket;

      // Cache the result
      this.cache.put(cacheKey, summary);

      return { ...summary };
    } catch (error) {
      console.error('Error fetching basket summary:', error);
      return this.createEmptyBasket();
    }
  }

  /**
   * Add an item to the basket
   * @param item The item to add
   * @returns Promise resolving to the updated basket
   */
  async addItem(item: BasketItem): Promise<Basket> {
    if (!this.customerId) {
      throw new Error('Customer ID not set');
    }

    try {
      const response = await this.apiClient.post<{ basket: Basket }>(
        `/customers/${this.customerId}/basket/items`,
        this.basketiseItem(item)
      );

      const basket = response.data.basket;
      this.updateCache(basket);

      return { ...basket };
    } catch (error) {
      console.error('Error adding item to basket:', error);
      throw error;
    }
  }

  /**
   * Add a product to the basket
   * @param product The product to add
   * @param quantity The quantity
   * @returns Promise resolving to the updated basket
   */
  async addProduct(product: UserProduct, quantity: number): Promise<Basket> {
    if (!this.customerId) {
      throw new Error('Customer ID not set');
    }

    try {
      const productData = this.basketiseProduct(product, quantity);

      const response = await this.apiClient.post<{ basket: Basket }>(
        `/customers/${this.customerId}/basket/items`,
        productData
      );

      const basket = response.data.basket;
      this.updateCache(basket);

      return { ...basket };
    } catch (error) {
      console.error('Error adding product to basket:', error);
      throw error;
    }
  }

  /**
   * Add multiple products to the basket
   * @param products Array of products to add
   * @returns Promise resolving to the updated basket
   */
  async addProducts(products: UserProduct[]): Promise<Basket> {
    if (!this.customerId) {
      throw new Error('Customer ID not set');
    }

    try {
      const productData = products.map(product =>
        this.basketiseProduct(product, product.orderQuantity || 1)
      );

      const response = await this.apiClient.post<{ basket: Basket }>(
        `/customers/${this.customerId}/basket/basketItems`,
        productData
      );

      const basket = response.data.basket;
      this.updateCache(basket);

      return { ...basket };
    } catch (error) {
      console.error('Error adding products to basket:', error);
      throw error;
    }
  }

  /**
   * Remove an item from the basket
   * @param itemId The ID of the item to remove
   * @returns Promise resolving to the updated basket
   */
  async removeItem(itemId: string): Promise<Basket> {
    if (!this.customerId) {
      throw new Error('Customer ID not set');
    }

    try {
      const response = await this.apiClient.delete<{ basket: Basket }>(
        `/customers/${this.customerId}/basket/items/${itemId}`
      );

      const basket = response.data.basket;
      this.updateCache(basket);

      return { ...basket };
    } catch (error) {
      console.error('Error removing item from basket:', error);
      throw error;
    }
  }

  /**
   * Update an item in the basket
   * @param itemId The ID of the item to update
   * @param item The updated item data
   * @returns Promise resolving to the updated basket
   */
  async updateItem(itemId: string, item: Partial<BasketItem>): Promise<Basket> {
    if (!this.customerId) {
      throw new Error('Customer ID not set');
    }

    try {
      const productData = this.basketiseItem({ ...item, id: itemId } as BasketItem);
      productData.basketItemId = itemId;

      const response = await this.apiClient.put<{ basket: Basket }>(
        `/customers/${this.customerId}/basket/items`,
        productData
      );

      const basket = response.data.basket;
      this.updateCache(basket);

      return { ...basket };
    } catch (error) {
      console.error('Error updating basket item:', error);
      throw error;
    }
  }

  /**
   * Configure the order
   * @param data Order configuration data
   * @returns Promise resolving to the updated basket
   */
  async configureOrder(data: OrderConfiguration): Promise<Basket> {
    if (!this.customerId) {
      throw new Error('Customer ID not set');
    }

    try {
      const response = await this.apiClient.put<{ basket: Basket }>(
        `/customers/${this.customerId}/basket`,
        data
      );

      const basket = response.data.basket;
      this.updateCache(basket);

      return { ...basket };
    } catch (error) {
      console.error('Error configuring order:', error);
      throw error;
    }
  }

  /**
   * Set driver tip
   * @param amount The tip amount
   * @returns Promise resolving to the updated basket
   */
  async setDriverTip(amount: number): Promise<Basket> {
    if (!this.customerId) {
      throw new Error('Customer ID not set');
    }

    try {
      const response = await this.apiClient.post<{ basket: Basket }>(
        `/customers/${this.customerId}/basket/tip`,
        { amount }
      );

      const basket = response.data.basket;
      this.updateCache(basket);

      return { ...basket };
    } catch (error) {
      console.error('Error setting driver tip:', error);
      throw error;
    }
  }

  /**
   * Add a selected free product to the basket
   * @param autoComboMatchId The ID of the auto combo match
   * @returns Promise resolving to the updated basket
   */
  async addSelectedFreeProduct(autoComboMatchId: string): Promise<Basket> {
    if (!this.customerId) {
      throw new Error('Customer ID not set');
    }

    try {
      const response = await this.apiClient.put<{ basket: Basket }>(
        `/customers/${this.customerId}/basket/items/free-product`,
        { id: autoComboMatchId }
      );

      const basket = response.data.basket;
      this.updateCache(basket);

      return { ...basket };
    } catch (error) {
      console.error('Error adding free product to basket:', error);
      throw error;
    }
  }

  /**
   * Add an auto combo item to the basket
   * @param autoComboMatch The auto combo match data
   * @returns Promise resolving to the updated basket
   */
  async addAutoComboItem(autoComboMatch: any): Promise<Basket> {
    if (!this.customerId) {
      throw new Error('Customer ID not set');
    }

    try {
      const data = this.basketiseProduct(
        new (UserProduct as any)(autoComboMatch.comboProduct, autoComboMatch.comboProductState),
        1
      );
      data.autoComboItems = autoComboMatch.replacedBasketItems.map((i: any) => i.id);

      const response = await this.apiClient.put<{ basket: Basket }>(
        `/customers/${this.customerId}/basket/items/auto-combo`,
        data
      );

      const basket = response.data.basket;
      this.updateCache(basket);

      return { ...basket };
    } catch (error) {
      console.error('Error adding auto combo item to basket:', error);
      throw error;
    }
  }

  /**
   * Reorder a previous order
   * @param orderId The ID of the order to reorder
   * @returns Promise resolving to the updated basket
   */
  async reorder(orderId: string): Promise<Basket> {
    if (!this.customerId) {
      throw new Error('Customer ID not set');
    }

    try {
      const response = await this.apiClient.post<{ basket: Basket }>(
        `/customers/${this.customerId}/basket/history/${orderId}/reorder`
      );

      const basket = response.data.basket;
      this.updateCache(basket);

      return { ...basket };
    } catch (error) {
      console.error('Error reordering:', error);
      throw error;
    }
  }

  /**
   * Update kerbside state
   * @param basketId The basket ID
   * @param status The kerbside status
   * @param coordinates The coordinates
   * @returns Promise resolving to the response data
   */
  async updateKerbsideState(basketId: string, status: string, coordinates?: any): Promise<any> {
    if (!this.customerId) {
      throw new Error('Customer ID not set');
    }

    try {
      const response = await this.apiClient.put<any>(
        `/customers/${this.customerId}/basket/kerbside`,
        { basketId, status, coordinates }
      );

      return response.data;
    } catch (error) {
      console.error('Error updating kerbside state:', error);
      throw error;
    }
  }

  /**
   * Get checkout instructions
   * @returns Promise resolving to the checkout instructions
   */
  async getCheckoutInstructions(): Promise<any[]> {
    if (!this.customerId) {
      throw new Error('Customer ID not set');
    }

    try {
      const basket = await this.getBasketSummary();
      const response = await this.apiClient.get<{ checkoutInstructions: any[] }>(
        `/v2/pack/checkout-instruction?basketId=${basket.id}`
      );

      return response.data.checkoutInstructions
        .map((i: any) => new (CheckoutInstruction as any)(i))
        .sort((a: any, b: any) => b.displayOrder - a.displayOrder);
    } catch (error) {
      console.error('Error getting checkout instructions:', error);
      return [];
    }
  }

  /**
   * Set checkout instructions
   * @param instructions The checkout instructions
   * @returns Promise resolving to the updated basket
   */
  async setCheckoutInstructions(instructions: any[]): Promise<Basket> {
    if (!this.customerId) {
      throw new Error('Customer ID not set');
    }

    try {
      const response = await this.apiClient.put<{ basket: Basket }>(
        `/customers/${this.customerId}/basket`,
        { checkoutInstructions: instructions.map(this.basketiseCheckoutInstruction) }
      );

      const basket = response.data.basket;
      this.updateCache(basket);

      return { ...basket };
    } catch (error) {
      console.error('Error setting checkout instructions:', error);
      throw error;
    }
  }

  /**
   * Clear the basket
   * @returns Promise resolving to an empty basket
   */
  async clearBasket(): Promise<Basket> {
    if (!this.customerId) {
      return this.createEmptyBasket();
    }

    try {
      // This would typically call an API endpoint to clear the basket
      // For now, we'll just create a new empty basket
      const emptyBasket = this.createEmptyBasket();

      // Update cache
      this.clearCache();

      return emptyBasket;
    } catch (error) {
      console.error('Error clearing basket:', error);
      return this.createEmptyBasket();
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    if (this.customerId) {
      this.cache.clear(`basket:${this.customerId}`);
      this.cache.clear(`basket-summary:${this.customerId}`);
    } else {
      this.cache.clearPattern('basket:*');
      this.cache.clearPattern('basket-summary:*');
    }
  }

  /**
   * Update the cache with a new basket
   * @param basket The basket to cache
   */
  private updateCache(basket: Basket): void {
    if (this.customerId) {
      this.cache.put(`basket:${this.customerId}`, basket);
      this.cache.put(`basket-summary:${this.customerId}`, basket);
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

  /**
   * Convert a basket item to the format expected by the API
   * @param item The basket item
   * @returns The formatted item
   */
  private basketiseItem(item: BasketItem): any {
    return {
      productId: item.productId,
      quantity: item.quantity,
      computedDescription: item.configuration || ''
    };
  }

  /**
   * Convert a product to the format expected by the API
   * @param product The product
   * @param quantity The quantity
   * @returns The formatted product
   */
  private basketiseProduct(product: UserProduct, quantity: number): any {
    const result: any = {
      productId: product.product.id,
      quantity: quantity,
      computedDescription: product.getConfigurationDescription()
    };

    if (product.hasRelatedProducts()) {
      result['children'] = product.getRelatedProducts(true)
        .filter(child => child.isSelected())
        .map(child => this.basketiseChildProduct(child));
    }

    return result;
  }

  /**
   * Convert a child product to the format expected by the API
   * @param product The child product
   * @returns The formatted child product
   */
  private basketiseChildProduct(product: UserProduct): any {
    const result: any = {
      productId: product.product.id
    };

    if (product.hasRelatedProducts()) {
      result['children'] = product.getRelatedProducts(true)
        .filter(child => child.isSelected())
        .map(child => this.basketiseChildProduct(child));
    }

    return result;
  }

  /**
   * Convert a checkout instruction to the format expected by the API
   * @param checkoutInstruction The checkout instruction
   * @returns The formatted checkout instruction
   */
  private basketiseCheckoutInstruction(checkoutInstruction: any): any {
    return {
      productId: checkoutInstruction.id,
      productName: checkoutInstruction.name
    };
  }
}

// Create a singleton instance
export const basketRepository = new BasketRepository(
  new ApiClient(),
  new CacheService()
);