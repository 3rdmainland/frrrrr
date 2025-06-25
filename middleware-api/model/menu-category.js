import ImageCollection from './image-collection'
import UserProduct from './user-product'
import ProductState from './product-state'
import Promotion from './promotion'

export const CATEGORY_DISPLAY_TYPES = {
	DEFAULT: 'DEFAULT',
	MUTED_CHILDREN: 'MUTED_CHILDREN',
	MOST_POPULAR: 'MOST_POPULAR',
	CAROUSEL: 'CAROUSEL',

	// The following display types are created at runtime by the frontend
	RECOMMENDATION: 'RECOMMENDATION',
	QUICK_LINK: 'QUICK_LINK',
}

export default class MenuCategory {

	static build(roots, categoryDefinitions, categoryMap, productMapByDefinitionId, promotionMap) {
		return new MenuCategory({children:roots}, categoryDefinitions, categoryMap, productMapByDefinitionId, promotionMap)
	}

	/**
	 * Builds a category without having to pass in categoryDefinitions, productMapByDefinitionId, promotionMap etc
	 * as you normally would when using `build`. The caveat being the children/roots passed in, must already be
	 * `Promotion` or `UserProduct` entities, as we don't have the relevant "maps" to look these definitions up. 
	 * 
	 */
	static quickBuild(roots) {
		return new MenuCategory({children:roots})
	}

	constructor(data, categoryDefinitions, categoryMap, productMapByDefinitionId, promotionMap, depth = 0) {

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
			.map(child => {
				if(child.destinationType == 'CATEGORY_DEFINITION') {
					let definition = categoryDefinitions.find(def => def.id == child.destinationId)
					if(definition) {
						return categoryMap[definition.id] || (categoryMap[definition.id] = new MenuCategory(definition, categoryDefinitions, categoryMap, productMapByDefinitionId, promotionMap, depth + 1))
					}
				}
				else if(child.destinationType == 'PRODUCT_DEFINITION') {
					let product = productMapByDefinitionId[child.destinationId]
					if(product)
						return new UserProduct(product, new ProductState())
				}
				else if(child.destinationType == 'PROMOTION_DEFINITION') {
					return promotionMap[child.destinationId]
				}
				// Used by `quickBuild` routine, no conversion/mapping required 
				else if(child instanceof Promotion || child instanceof UserProduct || child instanceof MenuCategory) {
					return child
				}
			})
			.filter(c => c != null)

		this.minPrice = this.getPriceFrom()
		this.features = this.computeFeatures()

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

	getPriceFrom(prices = []) {
		this.subCategories.forEach(c => c.getPriceFrom(prices)) 
		prices.push(...this.products.map(p => p.computePrice()))
		return Math.min(...prices)
	}

	computeFeatures(features = []) {
		this.subCategories.forEach(c => c.computeFeatures(features)) 
		this.products.map(p => features.push(...p.getFeatures()))
		return Array.from(new Set(features)) // dedupe
	}

	containsProduct( defintionId ) {
		let match = null
		let candidates = [this]
		while(!match && candidates.length > 0) {
			let candidate = candidates.shift()
			candidates.push(...candidate.subCategories)
			match = candidate.products.find(product => product.getDefinitionId() == defintionId)
		}
		return match != null
	}

	getQuickPickableProducts(matches = []) {
		this.products.forEach(p => p.canBeQuickPicked() ? matches.push(p) : null)
		this.subCategories.forEach(c => c.getQuickPickableProducts(matches)) 
		return matches
	}
}