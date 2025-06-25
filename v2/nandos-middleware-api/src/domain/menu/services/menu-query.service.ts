import { MenuRepository } from '../repositories/menu.repository';
import MenuDisplayItem from '../../../model/menu-display-item';
import Menu from '../../../model/menu';
import KeywordService from '../../../service/keyword-service';
import KeywordAutoconfigurator from '../../../service/keyword-autoconfig-service';
import UserProduct from '../../../model/user-product';
import ProductState from '../../../model/product-state';

/**
 * Service for querying menu data
 */
export class MenuQueryService {
  constructor(
    private menuRepository: MenuRepository,
    private keywordService: typeof KeywordService
  ) {}

  /**
   * Browse a menu category by path
   * @param path Path to the category
   * @param menuId Optional menu ID
   * @returns Promise resolving to a MenuDisplayItem
   */
  async browse(path: string, menuId?: string | null | undefined): Promise<MenuDisplayItem> {
    const menu = await this.menuRepository.getMenu(menuId);
    return new MenuDisplayItem(menu.browse([path]));
  }

  /**
   * Search for products by query
   * @param query Search query
   * @param menuId Optional menu ID
   * @returns Promise resolving to an array of MenuDisplayItems
   */
  async search(query: string, menuId?: string | null): Promise<MenuDisplayItem[]> {
    const keywords = await this.keywordService.resolveKeywords(query);
    const menu = await this.menuRepository.getMenu(menuId);
    
    return this.searchMenu(menu, keywords);
  }

  /**
   * Get quick links from the menu
   * @param menuId Optional menu ID
   * @returns Promise resolving to an array of MenuDisplayItems
   */
  async getQuickLinks(menuId?: string | null): Promise<MenuDisplayItem[]> {
    const menu = await this.menuRepository.getMenu(menuId);
    
    return menu.quickLinks
      .map(ql => new MenuDisplayItem(ql))
      .filter(i => !i.isEmpty);
  }

  /**
   * Search the menu for products matching keywords
   * @param menu The menu to search
   * @param keywords The keywords to search for
   * @returns Array of MenuDisplayItems
   */
  private searchMenu(menu: Menu, keywords: string[]): MenuDisplayItem[] {
    let results = menu
      .search(keywords, 30)
      .filter(result => !result.product.isHiddenByExclusion());

    results.forEach(r => {
      let state = new ProductState();
      let autoconf = KeywordAutoconfigurator.autoconfigure(
        r.product,
        keywords,
        state
      );
      r.autoconfig = autoconf.hits > 0;
      if (r.autoconfig) {
        r.score *= autoconf.hits * 0.5 + 1;
      }
      r.score *= r.product.userRelevance * 0.1 + 1;
      if (r.product.searchBias) {
        r.score *= r.product.searchBias;
      }
      r.product = new UserProduct(r.product, state);
    });

    results.sort((a, b) => b.score - a.score);

    return results.map(r => new MenuDisplayItem(r.product, r.autoconfig));
  }
}