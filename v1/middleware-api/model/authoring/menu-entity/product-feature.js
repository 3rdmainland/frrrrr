import '../../../util/admin-context-guard'
import { BaseEntity } from './internal'
import { mapI18nValues } from '../../../service/admin-language-service'
import ImageData from '../../image-data'


export default class ProductFeature extends BaseEntity {

	constructor(data) {
		super(data)
		this.name = mapI18nValues(data.name)
		this.description = mapI18nValues(data.description)
		this.icon = mapI18nValues(data.icon, icon => new ImageData(icon))
	}

}