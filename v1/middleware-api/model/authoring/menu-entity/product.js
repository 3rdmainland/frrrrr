import '../../../util/admin-context-guard'
import { BaseEntity } from './internal'
import ImageData from '../../image-data'
import { mapI18nValues } from '../../../service/admin-language-service'


export default class Product extends BaseEntity {

	constructor(data) {
		super(data)
		this.name = mapI18nValues(data.name)
		this.shortName = mapI18nValues(data.shortName)
		this.description = mapI18nValues(data.description)
		this.deliveryDisclaimer = mapI18nValues(data.deliveryDisclaimer)
		this.generalDisclaimer = mapI18nValues(data.generalDisclaimer)
		this.badge = data.badge && new ProductBadge(data.badge)
		this.hiddenFromAggregator = data.hiddenFromAggregator
		this.searchBias = data.searchBias
		this.servingSize = data.servingSize
		this.accentColor = data.accentColor
	}

}

export class ProductBadge {
	constructor(data = {}) {
		this.title = mapI18nValues(data.title)
		this.backgroundColor = data.backgroundColor
		this.textColor = data.textColor
	}
}