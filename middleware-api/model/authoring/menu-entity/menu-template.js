import '../../../util/admin-context-guard'
import { BaseEntity } from './internal'
import { mapI18nValues } from '../../../service/admin-language-service'


export default class MenuTemplate extends BaseEntity {

	constructor(data) {
		super(data)
		this.base = !!data.base
	}

}