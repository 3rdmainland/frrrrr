import '../../../util/admin-context-guard'
import { BaseEntity } from './internal'
import { mapI18nValues } from '../../../service/admin-language-service'


export default class ProductAllergen extends BaseEntity {

	constructor(data) {
		super(data)
		this.name = mapI18nValues(data.name)
		this.description = mapI18nValues(data.description)
	}

}