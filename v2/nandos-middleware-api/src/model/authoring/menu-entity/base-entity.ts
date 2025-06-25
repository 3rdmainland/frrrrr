import '../../../util/admin-context-guard';
import {
	BaseExternalEntity,
	Campaign,
	Category,
	Product,
	ProductFeature,
	Promotion,
	QuickLink,
	SearchKeyword,
	CheckoutInstruction,
	MenuTemplate,
	ProductAllergen,
	ProductNutritionalComponent,
	ProductExclusion,
	SystemNotification,
	AppSplash
} from './internal';
import AdminLanguageService from '../../../service/admin-language-service';
import { 
	type IMenuEntityRelation,
	type IMenuEntityRelationSpecification
} from '@nandos-types/model/authoring/menu-entity/menu';
import { ENTITY_TYPES, type TEntityType} from '@nandos-types/model/authoring/menu-entity/entity';
import { type IBaseEntity } from '@nandos-types/model/authoring/menu-entity/base-entity';
import { type IProduct } from '@nandos-types/model/authoring/menu-entity/product';
import { type ICategory } from '@nandos-types/model/authoring/menu-entity/category';
import { type ICampaign } from '@nandos-types/model/authoring/menu-entity/campaign';
import { type IAppSplash } from '@nandos-types/model/authoring/menu-entity/app-splash';
import { type IPromotion } from '@nandos-types/model/authoring/menu-entity/promotion';
import { type IQuickLink } from '@nandos-types/model/authoring/menu-entity/quick-link';
import { type IMenuTemplate } from '@nandos-types/model/authoring/menu-entity/menu-template';
import { type ISearchKeyword } from '@nandos-types/model/authoring/menu-entity/search-keyword';
import { type IProductFeature } from '@nandos-types/model/authoring/menu-entity/product-feature';
import { type IProductAllergen } from '@nandos-types/model/authoring/menu-entity/product-allergen';
import { type IProductExclusion } from '@nandos-types/model/authoring/menu-entity/product-exclusion';
import { type IBaseExternalEntity } from '@nandos-types/model/authoring/menu-entity/base-external-entity';
import { type ISystemNotification } from '@nandos-types/model/authoring/menu-entity/system-notification';
import { type ICheckoutInstruction } from '@nandos-types/model/authoring/menu-entity/checkout-instruction';
import { type IProductNutritionalComponent } from '@nandos-types/model/authoring/menu-entity/product-nutritional-component';

const patterns = {
	comboSide: /^CS/,
	comboMain: /^CM/,
	condiment: /^Cond/,
	/**
	 * Matches anything between "[" and "]"
	 * Example: "welcome [test] home [test-2]" -> ["test", "test-2"]
	 * https://stackoverflow.com/a/17779833
	 */
	tagStripper: /\[([^\]]+)\]/g,
}


export default class BaseEntity implements IBaseEntity {

	public id: string;
	public entityType: TEntityType;
	public systemName: string;
	public creator: string;
	public relationSpecifications: IMenuEntityRelationSpecification[];
	public relations: Record<string, IMenuEntityRelation[]>;

	constructor(data: IBaseEntity) {
		this.id = data.id
		this.entityType = data.entityType
		this.systemName = data.systemName
		this.creator = data.creator
		this.relationSpecifications = data.relationSpecifications
		this.relations = data.relations

		for( let relationshipQualifier in this.relations) {
			const relationsSet = this.relations[relationshipQualifier]
			relationsSet.forEach((relation) => {
				relation.destination = (relation.destination && BaseEntity.parseEntity(relation.destination));
			});
		}
	}

	get displayName() {
		// @ts-ignore - this.name can come from the super class
		let name = (this.name && typeof this.name == 'object' && (this.name[AdminLanguageService.languageBaseKey] || this.name[AdminLanguageService.defaultLanguage?.baseIso]));

		if (name) name = name.replace(/(<([^>]+)>)/ig, '') // strip html tags from name
		
		return name || this.systemName;
	}

	get parsedSystemName() {
		return this.systemName
			.replace(patterns.comboSide, '')
			.replace(patterns.comboMain, '')
			.replace(patterns.condiment, '')
			.replace(patterns.tagStripper, '')
			.replace(/\s+/g, ' ') // convert multiple spaces to single space
			.replace(/^\s?-\s?/, '') // remove "-" prefix 
			.trim()
	}

	get extractedSystemNameTags() {
		const tags = (this.systemName.match(patterns.tagStripper) || []).map(tag => tag.replace(/\[(.*)\]/, '$1'));
		if (this.systemName.match(patterns.comboSide)) tags.push('Combo Side');
		if (this.systemName.match(patterns.comboMain)) tags.push('Combo Main');
		if (this.systemName.match(patterns.condiment)) tags.push('Condiment');
		return Array
			.from(new Set(tags)) // dedupe
			.sort();
	}

	// Schedule helpers for schedule-able entities
	get isScheduleable() {
		// @ts-ignore - this.schedule can come from the super class
	  	return this.schedule != null;
	}
	
	get scheduleStatus() {
		// @ts-ignore - this.schedule can come from the super class
	  	return this.schedule?.status;
	}

	get nextScheduledOccurrence() {
		// @ts-ignore - this.schedule can come from the super class
	 	return this.schedule?.nextOccurrence;
	}
	
	static parseEntity<T extends IBaseEntity>(entity: T) {
		switch(entity.entityType) {
			case ENTITY_TYPES.MENU_TEMPLATE : return new MenuTemplate(entity as unknown as IMenuTemplate);
			case ENTITY_TYPES.CAMPAIGN_DEFINITION : return new Campaign(entity as unknown as ICampaign);
			case ENTITY_TYPES.CATEGORY_DEFINITION : return new Category(entity as unknown as ICategory);
			case ENTITY_TYPES.PRODUCT_DEFINITION : return new Product(entity as unknown as IProduct);
			case ENTITY_TYPES.PRODUCT_FEATURE_DEFINITION : return new ProductFeature(entity as unknown as IProductFeature);
			case ENTITY_TYPES.PROMOTION_DEFINITION : return new Promotion(entity as unknown as IPromotion);
			case ENTITY_TYPES.QUICK_LINK_DEFINITION : return new QuickLink(entity as unknown as IQuickLink);
			case ENTITY_TYPES.SEARCH_KEYWORD_DEFINITION : return new SearchKeyword(entity as unknown as ISearchKeyword);
			case ENTITY_TYPES.CHECKOUT_INSTRUCTION_DEFINITION : return new CheckoutInstruction(entity as unknown as ICheckoutInstruction);
			case ENTITY_TYPES.PRODUCT_ALLERGEN_DEFINITION : return new ProductAllergen(entity as unknown as IProductAllergen);
			case ENTITY_TYPES.PRODUCT_NUTRITIONAL_COMPONENT_DEFINITION : return new ProductNutritionalComponent(entity as unknown as IProductNutritionalComponent);
			case ENTITY_TYPES.PRODUCT_EXCLUSION_DEFINITION : return new ProductExclusion(entity as unknown as IProductExclusion);
			case ENTITY_TYPES.SYSTEM_NOTIFICATION_DEFINITION : return new SystemNotification(entity as unknown as ISystemNotification);
			case ENTITY_TYPES.APP_SPLASH_DEFINITION : return new AppSplash(entity as unknown as IAppSplash);
		
			case ENTITY_TYPES.EXTERNAL_PRODUCT:
			case ENTITY_TYPES.EXTERNAL_CHECKOUT_INSTRUCTION:
			case ENTITY_TYPES.EXTERNAL_STORE:
			case ENTITY_TYPES.EXTERNAL_FREE_PRODUCT: return BaseExternalEntity.parseEntity(entity as unknown as IBaseExternalEntity);

		  	default: return new BaseEntity(entity);
		}
	}

}
