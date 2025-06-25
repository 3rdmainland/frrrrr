import '../../../util/admin-context-guard';
import { BaseEntity } from './internal';
import { mapI18nValues } from '../../../service/admin-language-service';
import { type I18NString } from '@nandos-types/model/language';
import { 
	CATEGORY_DISPLAY_TYPES, 
	type TCategoryDisplayType, 
	type ICategory 
} from '@nandos-types/model/authoring/menu-entity/category';

export default class Category extends BaseEntity implements ICategory {

	public name: I18NString;
	public description: I18NString;
	public displayType: TCategoryDisplayType;
	public featured: boolean;
	public accentColor: string;
	public suppressChildAccentColors: boolean;

	constructor(data: ICategory) {
		super(data);
		this.name = mapI18nValues(data.name);
		this.description = mapI18nValues(data.description);
		this.displayType = CATEGORY_DISPLAY_TYPES[data.displayType];
		this.featured = !!data.featured;
		this.accentColor = data.accentColor;
		this.suppressChildAccentColors = !!data.suppressChildAccentColors;
	}
}