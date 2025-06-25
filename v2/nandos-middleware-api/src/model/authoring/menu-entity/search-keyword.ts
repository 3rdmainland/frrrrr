import '../../../util/admin-context-guard';
import { BaseEntity } from './internal';
import { type ISearchKeyword } from '@nandos-types/model/authoring/menu-entity/search-keyword';

export default class SearchKeyword extends BaseEntity implements ISearchKeyword {

	public keyword: string;
	public langIso: string;
	public synonyms: string;

	constructor(data: ISearchKeyword) {
		super(data);
		this.keyword = data.keyword;
		this.langIso = data.langIso;
		this.synonyms = data.synonyms;
	}

}