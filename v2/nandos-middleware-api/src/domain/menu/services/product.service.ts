import { MenuRepository } from '../repositories/menu.repository';
import UserProduct from '../../../model/user-product';
import ProductState from '../../../model/product-state';

/**
 * Service for managing products
 */
export class ProductService {
  private productRegistry: Map<string, UserProduct> = new Map();
  
  constructor(private menuRepository: MenuRepository) {}
  
  /**
   * Get a product by ID
   * @param productId The product ID
   * @param bypassCache Whether to bypass the cache
   * @param menuId Optional menu ID
   * @returns Promise resolving to a UserProduct or null
   */
  async getProduct(
    productId: string,
    bypassCache = false,
    menuId?: string | null
  ): Promise<UserProduct | null> {
    // Check registry cache first
    if (!bypassCache && this.productRegistry.has(productId)) {
      return this.productRegistry.get(productId)!;
    }
    
    // Get from menu
    const menu = await this.menuRepository.getMenu(menuId);
    const product = menu.productMap[productId];
    
    if (!product) {
      return null;
    }
    
    // Create user product
    const userProduct = new UserProduct(product, new ProductState());
    
    // Add to registry
    if (!bypassCache) {
      this.registerUserProduct(userProduct);
    }
    return userProduct;
  }
  
  /**
   * Get a product by definition ID
   * @param definitionId The product definition ID
   * @param bypassCache Whether to bypass the cache
   * @param menuId Optional menu ID
   * @returns Promise resolving to a UserProduct or null
   */
  async getProductByDefinitionId(
    definitionId: string,
    bypassCache = false,
    menuId?: string | null
  ): Promise<UserProduct | null> {
    const menu = await this.menuRepository.getMenu(menuId);
    const product = menu.productMapByDefinitionId[definitionId];
    
    if (!product) {
      return null;
    }
    
    return this.getProduct(product.id, bypassCache, menuId);
  }
  
  /**
   * Register a user product in the registry
   * @param userProduct The user product to register
   */
  registerUserProduct(userProduct: UserProduct): void {
    userProduct.orderQuantity = 1; // reset order quantity when a product is registered/re-registered
    this.productRegistry.set(userProduct.product.id, userProduct);
  }
  
  /**
   * Clear the product registry
   */
  clearRegistry(): void {
    this.productRegistry.clear();
  }
  
  /**
   * Get the product map from the menu
   * @param menuId Optional menu ID
   * @returns Promise resolving to the product map
   */
  async getProductMap(menuId?: string | null): Promise<Record<string, any>> {
    const menu = await this.menuRepository.getMenu(menuId);
    return menu.productMap;
  }
  
  /**
   * Get nutritional components from the menu
   * @param menuId Optional menu ID
   * @returns Promise resolving to an array of nutritional components
   */
  async getNutritionalComponents(menuId?: string | null): Promise<any[]> {
    const menu = await this.menuRepository.getMenu(menuId);
    return Object.values(menu.productNutritionalComponentsMap).sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );
  }
}