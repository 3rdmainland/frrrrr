import '../../../util/admin-context-guard'
import { BaseEntity } from './internal'
import { mapI18nValues } from '../../../service/admin-language-service'


export default class ProductNutritionalComponent extends BaseEntity {

	constructor(data) {
		super(data)
		this.name = mapI18nValues(data.name)
		this.description = mapI18nValues(data.description)
		this.recommendedDailyValue = data.recommendedDailyValue
		this.unit = data.unit
		this.subComponent = !!data.subComponent
		this.displayOrder = data.displayOrder
	}

}