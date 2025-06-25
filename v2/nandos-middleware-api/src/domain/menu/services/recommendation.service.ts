import { MenuRepository } from '../repositories/menu.repository';
import MenuDisplayItem from '../../../model/menu-display-item';
import UserProduct from '../../../model/user-product';
import ProductState from '../../../model/product-state';
import BehaviorAutoconfigurator from '../../../service/behavior-autoconfig-service';
import type Product from '../../../model/product';

/**
 * Service for product recommendations
 */
export class RecommendationService {
  constructor(
    private menuRepository: MenuRepository,
    private behaviorService: any
  ) {}

  /**
   * Get recommended products based on user behaviors
   * @param limit Maximum number of products to return
   * @param menuId Optional menu ID
   * @returns Promise resolving to an array of MenuDisplayItems
   */
  async getRecommendedProducts(
    limit = 5,
    menuId?: string | null
  ): Promise<MenuDisplayItem[]> {
    const [menu, behaviors] = await Promise.all([
      this.menuRepository.getMenu(menuId),
      this.getUserBehaviors()
    ]);

    // If no behaviors are available (e.g., for non-authenticated users),
    // provide fallback data using random products
    if (!behaviors.length) {
      const randomProducts = await this.getRandomProducts(
        limit,
        p => p.isAvailable()
      );

      return randomProducts.map(userProduct => {
        return new MenuDisplayItem(
          userProduct,
          userProduct.getConfigurationDescription() !== ""
        );
      });
    }

    return behaviors
      .sort((a, b) => b.score - a.score)
      .map(b => menu.productMapByDefinitionId[b.productDefinitionId])
      .filter(p => p !== null && p.isAvailable())
      .slice(0, limit)
      .map(product => {
        const userProduct = new UserProduct(product, new ProductState());
        BehaviorAutoconfigurator.autoconfigure(
          userProduct.product,
          userProduct.state
        );
        return new MenuDisplayItem(
          userProduct,
          userProduct.getConfigurationDescription() !== ""
        );
      });
  }

  /**
   * Get random products
   * @param count Number of products to return
   * @param productPredicate Function to filter products
   * @param configurePredicate Function to filter configurations or false to skip configuration
   * @param menuId Optional menu ID
   * @returns Promise resolving to an array of UserProducts
   */
  async getRandomProducts(
    count: number,
    productPredicate?: (product: Product) => boolean,
    configurePredicate?: ((product: Product) => boolean) | false,
    menuId?: string | null
  ): Promise<UserProduct[]> {
    const menu = await this.menuRepository.getMenu(menuId);

    return menu.getRandomProducts(count, productPredicate || (() => true)).map(product => {
      let state = new ProductState();

      if (configurePredicate !== false) {
        const configurePredicateIsFn = typeof configurePredicate === "function";

        const getSelectionCandidates = (parent: Product): Product[] | undefined => {
          let children = parent.getRelatedProducts();
          if (configurePredicateIsFn && configurePredicate) {
            children = children?.filter(child => configurePredicate(child));
          }

          if (children === null || children?.length === 0) {
            return [];
          }

          let requiredChildren = children?.filter(rp => rp.requiresSelection());
          if (requiredChildren?.length) {
            return requiredChildren;
          } else {
            if (children) return [children[Math.floor(children?.length * Math.random())]];
          }
        };

        const selectProduct = (candidates: Product[]): void => {
          candidates.forEach(candidate => {
            candidate.isLeaf()
              ? candidate.select(state)
              : selectProduct(getSelectionCandidates(candidate));
          });
        };

        selectProduct(getSelectionCandidates(product));
      }

      return new UserProduct(product, state);
    });
  }

  /**
   * Get a random product
   * @param productPredicate Function to filter products
   * @param configurePredicate Function to filter configurations or false to skip configuration
   * @param menuId Optional menu ID
   * @returns Promise resolving to a UserProduct
   */
  async getRandomProduct(
    productPredicate?: (product: Product) => boolean,
    configurePredicate?: ((product: Product) => boolean) | false,
    menuId?: string | null
  ): Promise<UserProduct> {
    const products = await this.getRandomProducts(
      1,
      productPredicate,
      configurePredicate,
      menuId
    );
    return products[0];
  }

  /**
   * Get user behaviors
   * @returns Promise resolving to an array of user behaviors
   */
  private async getUserBehaviors(): Promise<any[]> {
    if (!this.behaviorService) {
      return [];
    }
    return this.behaviorService.getBehaviorData();
  }
}
