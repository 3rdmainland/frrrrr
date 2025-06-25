import ImageCollection from './image-collection';
import UserProduct from './user-product';
import ProductState from './product-state';
import Promotion from './promotion';
import { ENTITY_TYPES } from '@nandos-types/model/authoring/menu-entity/entity';
import type { I18NString } from '@nandos-types/model/language';
import type Product from './product';
import type ProductFeature from './product-feature';
import {
	CATEGORY_DISPLAY_TYPES,
	type TCategoryDisplayType,
	type IMenuCategory
} from '@nandos-types/model/menu-category';

export default class MenuCategory {

	public id: string;
	public name: I18NString;
	public description: I18NString;
	public displayType: TCategoryDisplayType;
	public featured: boolean;
	public accentColor: string;
	public suppressChildAccentColors: boolean;

	public idPath: string;
	public imageCollection: ImageCollection;
	public minPrice: number;
	public children: any[];
	public features: ProductFeature[];

	static build(
		roots: any, 
		categoryDefinitions: IMenuCategory[], 
		categoryMap: Record<string, MenuCategory>, 
		productMapByDefinitionId: Record<string, Product>, 
		promotionMap: Record<string, Promotion>
	) {
		return new MenuCategory({children:roots} as IMenuCategory, categoryDefinitions, categoryMap, productMapByDefinitionId, promotionMap);
	}

	/**
	 * Builds a category without having to pass in categoryDefinitions, productMapByDefinitionId, promotionMap etc
	 * as you normally would when using `build`. The caveat being the children/roots passed in, must already be
	 * `Promotion` or `UserProduct` entities, as we don't have the relevant "maps" to look these definitions up. 
	 * 
	 */
	static quickBuild(roots: any) {
		return new MenuCategory({children:roots} as IMenuCategory, [], {}, {}, {});
	}

	constructor(
		data: IMenuCategory, 
		categoryDefinitions: IMenuCategory[], 
		categoryMap: Record<string, MenuCategory>, 
		productMapByDefinitionId: Record<string, Product>, 
		promotionMap: Record<string, Promotion>, 
		depth = 0
	) {

		this.id = data.id
		this.name = data.name
		this.description = data.description
		this.displayType = data.displayType || CATEGORY_DISPLAY_TYPES.DEFAULT
		this.featured = !!data.featured
		this.accentColor = data.accentColor
		this.suppressChildAccentColors = !!data.suppressChildAccentColors

	  // The key we will use as part of a URL when browsing categories
		this.idPath = this.id
		this.imageCollection = new ImageCollection(data.images)

		this.children = (data.children || [])
			.map((child: any) => {
				if(child.destinationType === ENTITY_TYPES.CATEGORY_DEFINITION) {
					const definition = categoryDefinitions.find((def: any) => def.id == child.destinationId);
					if(definition) {
						return categoryMap[definition.id] || (categoryMap[definition.id] = new MenuCategory(definition, categoryDefinitions, categoryMap, productMapByDefinitionId, promotionMap, depth + 1));
					}
				}
				else if(child.destinationType === ENTITY_TYPES.PRODUCT_DEFINITION) {
					const product = productMapByDefinitionId[child.destinationId]
					if(product)
						return new UserProduct(product, new ProductState());
				}
				else if(child.destinationType === ENTITY_TYPES.PROMOTION_DEFINITION) {
					return promotionMap[child.destinationId]
				}
				// Used by `quickBuild` routine, no conversion/mapping required 
				else if(child instanceof Promotion || child instanceof UserProduct || child instanceof MenuCategory) {
					return child
				}
			})
			.filter((c: any) => c != null)

		this.minPrice = this.getPriceFrom();
		this.features = this.computeFeatures();

		if(categoryMap) categoryMap[this.id] = this
	}

	get subCategories() {
		return this.children.filter(child => child instanceof MenuCategory)
	}

	get products() {
		return this.children.filter(child => child instanceof UserProduct)
	}

	get promotions() {
		return this.children.filter(child => child instanceof Promotion)
	}

	getPriceFrom(prices: number[] = []) {
		this.subCategories.forEach(c => c.getPriceFrom(prices));
		prices.push(...this.products.map(p => p.computePrice()))
		return Math.min(...prices);
	}

	computeFeatures(features: ProductFeature[] = []) {
		this.subCategories.forEach(c => c.computeFeatures(features));
		this.products.map(p => features.push(...(p.getFeatures() || [])));
		return Array.from(new Set(features)); // dedupe
	}

	containsProduct(defintionId: string) {
		let match = null;
		const candidates: MenuCategory[] = [this];
		while(!match && candidates.length > 0) {
			const candidate = candidates.shift();
			candidates.push(...(candidate?.subCategories || []));
			match = candidate?.products.find(product => product.getDefinitionId() == defintionId);
		}
		return match != null;
	}

	getQuickPickableProducts(matches: UserProduct[] = []) {
		this.products.forEach(p => p.canBeQuickPicked() ? matches.push(p) : null)
		this.subCategories.forEach(c => c.getQuickPickableProducts(matches)) 
		return matches;
	}
}