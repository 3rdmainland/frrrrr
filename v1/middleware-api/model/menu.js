import Product from './product'
import ProductDefinition from './product-definition'
import Promotion from './promotion'
import ProductFeature from './product-feature'
import MenuCategory, { CATEGORY_DISPLAY_TYPES } from './menu-category'
import MenuSearchIndex from './menu-search-index'
import logger from 'nandos-dev-logger'

export default class Menu {

	constructor(data, promotions) {
		this.id = data.id
		this.baseMenu = data.baseMenu

		this.checkoutInstructions = data.checkoutInstructions || []

		this.productFeaturesMap = data.productFeatures.reduce((acc, feature) => {acc[feature.id] = new ProductFeature(feature); return acc;}, {})		
		this.productAllergenMap = data.productAllergens.reduce((acc, allergen) => {acc[allergen.id] = allergen; return acc;}, {})
		this.productNutritionalComponentsMap = data.nutritionalComponents.reduce((acc, nComp) => {acc[nComp.id] = nComp; return acc;}, {})
		this.productDefinitionsMap = data.productDefinitions.reduce((acc, definition) => {acc[definition.id] = new ProductDefinition(definition, this.productFeaturesMap, this.productNutritionalComponentsMap, this.productAllergenMap); return acc;}, {})

		this.products = data.products.map(p => new Product(p, null, null, this.productDefinitionsMap))
		this.productMap = this.products.reduce((acc, p) => {acc[p.id] = p; return acc;}, {})
		this.productMapByDefinitionId = this.products.reduce((acc, p) => {acc[p.definitionId] = p; return acc;}, {})

		this.promotionMap = promotions.reduce((acc, promotion) => {acc[promotion.id] = promotion; return acc;}, {})
		
		// Combine quick links with categories as we need to create a category for each quick link as well
		let rawCategories = [].concat(data.categories, data.quickLinks)
		this.categoryMap = {}
		rawCategories.forEach(category => new MenuCategory(category, rawCategories, this.categoryMap, this.productMapByDefinitionId, this.promotionMap))
		
		this.quickLinks = (data.quickLinks || []).map(quickLink => this.categoryMap[quickLink.id])
		this.quickLinks.forEach(ql => ql.displayType = CATEGORY_DISPLAY_TYPES.QUICK_LINK)

		this.rootCategory = MenuCategory.build(data.rootCategories, rawCategories, this.categoryMap, this.productMapByDefinitionId, this.promotionMap)
		this._searchIndex = new MenuSearchIndex(this.products)
	}

	browse(path) {
		let id = path && path[path.length - 1]
		return path ? this.categoryMap[id] : this.rootCategory
	}

	search(keywords, limit) {
		return this._searchIndex.keywordSearch(keywords, limit)
	}

	getRandomProducts(count, predicate) {
		const MAX_TRIES = 500
		let tryCount = 0
		let results = []

		while(results.length < count && tryCount++ < MAX_TRIES) {
			let candidate = this.products[Math.floor(this.products.length * Math.random())]
			if(predicate == null || predicate(candidate))
			results.push(candidate)
		}

		if(results.length < count) logger.warn('Nandos Middleware', `Unable to find ${count} products that match predicate`, predicate)
		
		return results
	}

}