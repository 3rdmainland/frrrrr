import KeywordService from '../service/keyword-service';
import ImageCollection from './image-collection';
import { PRODUCT_EXCLUSION_TYPES } from '@nandos-types/model/product';
import type ProductFeature from './product-feature';
import type { IProductDefinition, IConfigurationGroup } from '@nandos-types/model/product-definition';
import type { IAllergen, INutritionalComponent } from '@nandos-types/model/menu';
import type { IProductBadge } from '@nandos-types/model/product-badge';

export default class ProductDefinition {

	public id: string;
	public name: string;
	public shortName: string;
	public description: string;
	public searchKeywords: Record<string, string>;
	public autoconfigKeywords: Record<string, string>;
	public generalDisclaimer: string;
	public deliveryDisclaimer: string;
	public accentColor: string;
	public imageCollection: ImageCollection;
	public badge: IProductBadge;
	public features: ProductFeature[];
	public servingSize: number;
	public nutritionalComponents: WeightedNutritionalComponent[];
	public hasNutritionalInfo: boolean;
	public allergens: IAllergen[];
	public hasAllergenInfo: boolean;
	public searchBias: number;
	public upsells: any;
	public exclusions: any[];
	public configurationGroups?: IConfigurationGroup[];

	constructor(
		data: IProductDefinition, 
		productFeaturesMap: Record<string, ProductFeature>, 
		productNutritionalComponentsMap: Record<string, INutritionalComponent>, 
		productAllergenMap: Record<string, IAllergen>
	) {
		this.id = data.id;
		this.name = data.name || '';
		this.shortName = data.shortName || this.name;
		this.description = data.description;
		this.searchKeywords = this._computeKeywords((data.searchKeywords || undefined), true); // if keywords are `null` rather send in `undefined`
		this.autoconfigKeywords = this._computeKeywords((data.autoconfigKeywords || undefined)); // if keywords are `null` rather send in `undefined`
		this.generalDisclaimer = data.generalDisclaimer;
		this.deliveryDisclaimer = data.deliveryDisclaimer;
		this.accentColor = data.accentColor;
		this.imageCollection = new ImageCollection(data.images);
		this.badge = data.badge;
		this.features = (data.features || []).map((featureId) => productFeaturesMap[featureId]);
		this.servingSize = data.servingSize;
		this.nutritionalComponents = (data.nutritionalComponents || []).map(rel => 
			new WeightedNutritionalComponent(
				rel.weight, 
				this.servingSize, 
				rel.perServingWeight, 
				productNutritionalComponentsMap[rel.destinationId]
			)
		);
		this.hasNutritionalInfo = this.nutritionalComponents.length > 0;
		this.allergens = (data.allergens || []).map(allergenId => productAllergenMap[allergenId]);
		this.hasAllergenInfo = this.allergens.length > 0;
		this.searchBias = data.searchBias;
		this.upsells = data.upsells;
		this.exclusions = []; // will be managed by `ProductAvailabilityService`
		this.configurationGroups = data.configurationGroups;
	}

	get isAvailable() {
		return this.exclusions.length == 0;
	}

	get isHiddenByExclusion() {
		return this.exclusions.includes(PRODUCT_EXCLUSION_TYPES.HIDDEN);
	}

	private _computeKeywords(keywords: string[] = [], includeName = false, minLen = 3) {

		let result = keywords
			.map(keyword => keyword.toLowerCase().trim())
			.filter(keyword => keyword.length >= minLen);

		if (result.length == 0 || includeName) {
			result = result.concat(KeywordService.extractKeywords(this.name));
		}

		return result.reduce((acc, t) => {
			acc[t] = t; 
			return acc;
		}, {} as Record<string, string>);
	}

}

class WeightedNutritionalComponent {

	public weight: number;
	public servingSize: number;
	public perServingWeight: number;
	public nutritionalComponent: INutritionalComponent;

	constructor(
		weight: number,
		servingSize: number,
		perServingWeight: number,
		nutritionalComponent: INutritionalComponent
	) {
		this.weight = weight || 0
		this.servingSize = servingSize || 0
		this.perServingWeight = perServingWeight || 0;
		this.nutritionalComponent = nutritionalComponent;
	}

	get name() { return this.nutritionalComponent.name }

	get description() { return this.nutritionalComponent.description }

	get id() { return this.nutritionalComponent.id }

	get per100g() { return this.weight }
	get perServing() { return this.perServingWeight ? this.perServingWeight : (this.servingSize / 100) * this.weight }

}

export type TWeightedNutritionalComponent = WeightedNutritionalComponent;
