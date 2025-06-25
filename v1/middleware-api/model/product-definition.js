import KeywordService from '../service/keyword-service'
import ImageCollection from './image-collection'
import EXCLUSION_TYPES from './product-exclusion-types'

export default class ProductDefinition {

	constructor(data, productFeaturesMap, productNutritionalComponentsMap, productAllergenMap) {
		this.id = data.id;
		this.name = data.name || '';
		this.shortName = data.shortName || this.name;
		this.description = data.description;
		this.searchKeywords = this._computeKeywords((data.searchKeywords || undefined), true); // if keywords are `null` rather send in `undefined`
		this.autoconfigKeywords = this._computeKeywords((data.autoconfigKeywords || undefined)); // if keywords are `null` rather send in `undefined`
		this.generalDisclaimer = data.generalDisclaimer;
		this.deliveryDisclaimer = data.deliveryDisclaimer;
		this.accentColor = data.accentColor
		this.imageCollection = new ImageCollection(data.images)
		this.badge = data.badge
		this.features = (data.features || []).map(featureId => productFeaturesMap[featureId]);
		this.servingSize = data.servingSize
		this.nutritionalComponents = (data.nutritionalComponents || []).map(rel => new WeightedNutritionalComponent(rel.weight, this.servingSize, rel.perServingWeight, productNutritionalComponentsMap[rel.destinationId]))
		this.hasNutritionalInfo = this.nutritionalComponents.length > 0
		this.allergens = (data.allergens || []).map(allergenId => productAllergenMap[allergenId]);
		this.hasAllergenInfo = this.allergens.length > 0
		this.searchBias = data.searchBias;
		this.upsells = data.upsells;
		this.exclusions = [] // will be managed by `ProductAvailabilityService`
	}

	get isAvailable() {
		return this.exclusions.length == 0
	}

	get isHiddenByExclusion() {
		return this.exclusions.includes(EXCLUSION_TYPES.HIDDEN)
	}

	_computeKeywords(keywords = [], includeName = false, minLen = 3) {

		let result = keywords
			.map(keyword => keyword.toLowerCase().trim())
			.filter(keyword => keyword.length >= minLen);

		if (result.length == 0 || includeName) {
			result = result.concat(KeywordService.extractKeywords(this.name));
		}

		return result.reduce((acc, t) => {acc[t] = t; return acc;}, {});
	}

}

class WeightedNutritionalComponent {

	constructor(weight, servingSize, perServingWeight, nutritionalComponent) {
		this.weight = weight || 0
		this.servingSize = servingSize || 0
		this.perServingWeight = perServingWeight || 0;
		this.nutritionalComponent = nutritionalComponent
	}

	get name() { return this.nutritionalComponent.name }
	
	get description() { return this.nutritionalComponent.description }

	get id() { return this.nutritionalComponent.id }

	get per100g() { return this.weight }
	get perServing() { return this.perServingWeight ? this.perServingWeight : (this.servingSize / 100) * this.weight }

}