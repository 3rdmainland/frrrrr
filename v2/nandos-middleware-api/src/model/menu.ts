import Product from "./product";
import ProductDefinition from "./product-definition";
import MenuSearchIndex from "./menu-search-index";
import ProductFeature from "./product-feature";
import MenuCategory from "./menu-category";
import type Promotion from "./promotion";
import type { IProductFeature } from "@nandos-types/model/product-feature";
import type {
  INutritionalComponent,
  IAllergen,
  IMenu,
} from "@nandos-types/model/menu";
import {
  CATEGORY_DISPLAY_TYPES,
  type IMenuCategory,
} from "@nandos-types/model/menu-category";

export default class Menu {
  public id: string;
  public baseMenu: boolean;
  public checkoutInstructions: any[];
  public productFeaturesMap: Record<string, ProductFeature>;
  public productAllergenMap: Record<string, IAllergen>;
  public productNutritionalComponentsMap: Record<string, INutritionalComponent>;
  public productDefinitionsMap: Record<string, ProductDefinition>;
  public products: Product[];
  public productMap: Record<string, Product>;
  public productMapByDefinitionId: Record<string, Product>;
  public promotionMap: Record<string, Promotion>;
  public categoryMap: Record<string, MenuCategory>;
  public quickLinks: MenuCategory[];
  public rootCategory: MenuCategory;
  private _searchIndex: MenuSearchIndex;

  constructor(data: IMenu, promotions: Promotion[]) {
    this.id = data.id;
    this.baseMenu = data.baseMenu;
    this.checkoutInstructions = data.checkoutInstructions || [];

    this.productFeaturesMap = data.productFeatures.reduce(
      (acc: Record<string, ProductFeature>, feature: IProductFeature) => {
        acc[feature.id] = new ProductFeature(feature);
        return acc;
      },
      {},
    );

    this.productAllergenMap = data.productAllergens.reduce(
      (acc: Record<string, IAllergen>, allergen: IAllergen) => {
        acc[allergen.id] = allergen;
        return acc;
      },
      {},
    );

    this.productNutritionalComponentsMap = data.nutritionalComponents.reduce(
      (
        acc: Record<string, INutritionalComponent>,
        nComp: INutritionalComponent,
      ) => {
        acc[nComp.id] = nComp;
        return acc;
      },
      {},
    );

    this.productDefinitionsMap = data.productDefinitions.reduce(
      (acc: Record<string, ProductDefinition>, definition) => {
        acc[definition.id] = new ProductDefinition(
          definition,
          this.productFeaturesMap,
          this.productNutritionalComponentsMap,
          this.productAllergenMap,
        );
        return acc;
      },
      {},
    );

    this.products = data.products.map(
      (p) => new Product(p, null, null, this.productDefinitionsMap),
    );

    // console.log("prod feature", JSON.stringify(data));

    this.productMap = this.products.reduce(
      (acc: Record<string, Product>, p) => {
        // fixme
        acc[p.id] = p;

        // If idPath is different from id, add that mapping too
        if (p.idPath && p.idPath !== p.id) {
          acc[p.idPath] = p;
        }

        return acc;
      },
      {},
    );

    this.productMapByDefinitionId = this.products.reduce(
      (acc: Record<string, Product>, p) => {
        if (p.definitionId) acc[p.definitionId] = p;
        return acc;
      },
      {},
    );

    this.promotionMap = promotions.reduce(
      (acc: Record<string, Promotion>, promotion) => {
        acc[promotion.id] = promotion;
        return acc;
      },
      {},
    );

    // Combine quick links with categories as we need to create a category for each quick link as well
    const rawCategories: IMenuCategory[] = [
      ...data.categories,
      ...data.quickLinks,
    ];
    this.categoryMap = {};
    rawCategories.forEach(
      (category) =>
        new MenuCategory(
          category,
          rawCategories,
          this.categoryMap,
          this.productMapByDefinitionId,
          this.promotionMap,
        ),
    );

    this.quickLinks = (data.quickLinks || []).map(
      (quickLink) => this.categoryMap[quickLink.id],
    );
    this.quickLinks.forEach(
      (ql) => (ql.displayType = CATEGORY_DISPLAY_TYPES.QUICK_LINK),
    );

    this.rootCategory = MenuCategory.build(
      data.rootCategories,
      rawCategories,
      this.categoryMap,
      this.productMapByDefinitionId,
      this.promotionMap,
    );
    this._searchIndex = new MenuSearchIndex(this.products);
  }

  browse(path: string[]) {
    const id = path && path[path.length - 1];
    return path ? this.categoryMap[id] : this.rootCategory;
  }

  search(keywords: string[], limit: boolean | number) {
    return this._searchIndex.keywordSearch(keywords, limit);
  }

  getRandomProducts(count: number, predicate: (p: Product) => boolean) {
    const MAX_TRIES = 500;
    let tryCount = 0;
    const results = [];

    while (results.length < count && tryCount++ < MAX_TRIES) {
      const candidate =
        this.products[Math.floor(this.products.length * Math.random())];
      if (predicate == null || predicate(candidate)) results.push(candidate);
    }

    if (results.length < count)
      console.warn(
        "Nandos Middleware",
        `Unable to find ${count} products that match predicate`,
        predicate,
      );

    return results;
  }
}
