import '../../../util/admin-context-guard'
import { BaseExternalEntity, EXTERNAL_TYPES, Campaign, Category, Product, ProductFeature, Promotion, QuickLink, SearchKeyword, CheckoutInstruction, MenuTemplate, ProductAllergen, ProductNutritionalComponent, ProductExclusion, SystemNotification, AppSplash } from './internal'
import AdminLanguageService from '../../../service/admin-language-service'

export const TYPES = {
  MENU_TEMPLATE: 'MENU_TEMPLATE',
  CAMPAIGN_DEFINITION: 'CAMPAIGN_DEFINITION',
  CATEGORY_DEFINITION: 'CATEGORY_DEFINITION',
  PRODUCT_DEFINITION: 'PRODUCT_DEFINITION',
  CHECKOUT_INSTRUCTION_DEFINITION: 'CHECKOUT_INSTRUCTION_DEFINITION',
  PRODUCT_FEATURE_DEFINITION: 'PRODUCT_FEATURE_DEFINITION',
  PROMOTION_DEFINITION: 'PROMOTION_DEFINITION',
  QUICK_LINK_DEFINITION: 'QUICK_LINK_DEFINITION',
  SEARCH_KEYWORD_DEFINITION: 'SEARCH_KEYWORD_DEFINITION',
  PRODUCT_ALLERGEN_DEFINITION: 'PRODUCT_ALLERGEN_DEFINITION',
  PRODUCT_NUTRITIONAL_COMPONENT_DEFINITION: 'PRODUCT_NUTRITIONAL_COMPONENT_DEFINITION',
  PRODUCT_EXCLUSION_DEFINITION: 'PRODUCT_EXCLUSION_DEFINITION',
  SYSTEM_NOTIFICATION_DEFINITION: 'SYSTEM_NOTIFICATION_DEFINITION',
  APP_SPLASH_DEFINITION: 'APP_SPLASH_DEFINITION',
}

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

export default class BaseEntity {

	constructor(data) {
		this.id = data.id
		this.entityType = data.entityType
		this.systemName = data.systemName
		this.creator = data.creator
		this.relationSpecifications = data.relationSpecifications
		this.relations = data.relations

		for( let relationshipQualifier in this.relations) {
			let relationsSet = this.relations[relationshipQualifier]
			relationsSet.forEach(relation => relation.destination = relation.destination && BaseEntity.parseEntity(relation.destination))
		}
	}

	get displayName() {
		let name = (this.name && typeof this.name == 'object' && (this.name[AdminLanguageService.languageBaseKey] || this.name[AdminLanguageService.defaultLanguage.baseIso]))
		
		if(name) name = name.replace(/(<([^>]+)>)/ig, '') // strip html tags from name
		
		return name || this.systemName
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
		let tags = (this.systemName.match(patterns.tagStripper) || []).map(tag => tag.replace(/\[(.*)\]/, '$1'))
		if(this.systemName.match(patterns.comboSide)) tags.push('Combo Side')
		if(this.systemName.match(patterns.comboMain)) tags.push('Combo Main')
		if(this.systemName.match(patterns.condiment)) tags.push('Condiment')
		return Array
			.from(new Set(tags)) // dedupe
			.sort()
	}

	// Schedule helpers for schedule-able entities
	get isScheduleable() {
	  return this.schedule != null
	}
	
	get scheduleStatus() {
	  return this.schedule.status
	}

	get nextScheduledOccurrence() {
	  return this.schedule.nextOccurrence
	}

	static parseEntity(entity) {
		switch(entity.entityType) {
		  case TYPES.MENU_TEMPLATE : return new MenuTemplate(entity)
		  case TYPES.CAMPAIGN_DEFINITION : return new Campaign(entity)
		  case TYPES.CATEGORY_DEFINITION : return new Category(entity)
		  case TYPES.PRODUCT_DEFINITION : return new Product(entity)
		  case TYPES.PRODUCT_FEATURE_DEFINITION : return new ProductFeature(entity)
		  case TYPES.PROMOTION_DEFINITION : return new Promotion(entity)
		  case TYPES.QUICK_LINK_DEFINITION : return new QuickLink(entity)
		  case TYPES.SEARCH_KEYWORD_DEFINITION : return new SearchKeyword(entity)
		  case TYPES.CHECKOUT_INSTRUCTION_DEFINITION : return new CheckoutInstruction(entity)
		  case TYPES.PRODUCT_ALLERGEN_DEFINITION : return new ProductAllergen(entity)
		  case TYPES.PRODUCT_NUTRITIONAL_COMPONENT_DEFINITION : return new ProductNutritionalComponent(entity)
		  case TYPES.PRODUCT_EXCLUSION_DEFINITION : return new ProductExclusion(entity)
		  case TYPES.SYSTEM_NOTIFICATION_DEFINITION : return new SystemNotification(entity)
		  case TYPES.APP_SPLASH_DEFINITION : return new AppSplash(entity)

		  case EXTERNAL_TYPES.EXTERNAL_PRODUCT:
		  case EXTERNAL_TYPES.EXTERNAL_CHECKOUT_INSTRUCTION:
		  case EXTERNAL_TYPES.EXTERNAL_STORE:
		  case EXTERNAL_TYPES.EXTERNAL_FREE_PRODUCT: return BaseExternalEntity.parseEntity(entity)

		  default: return new BaseEntity(entity)
		}
	}

}
