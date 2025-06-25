import '../../../util/admin-context-guard';
import { BaseEntity } from './internal';
import { mapI18nValues } from '../../../service/admin-language-service';
import { type I18NString } from '@nandos-types/model/language';
import { type IQuickLink } from '@nandos-types/model/authoring/menu-entity/quick-link';

export default class QuickLink extends BaseEntity implements IQuickLink {
	
	public name: I18NString;

	constructor(data: IQuickLink) {
		super(data);
		this.name = mapI18nValues(data.name);
	}

}