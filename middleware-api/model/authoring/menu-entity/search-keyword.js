import '../../../util/admin-context-guard'
import { BaseEntity } from './internal'

export default class SearchKeyword extends BaseEntity {

	constructor(data) {
		super(data)
		this.keyword = data.keyword
		this.langIso = data.langIso
		this.synonyms = data.synonyms
	}

}