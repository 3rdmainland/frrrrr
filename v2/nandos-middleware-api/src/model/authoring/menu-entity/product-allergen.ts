import '../../../util/admin-context-guard';
import { BaseEntity } from './internal';
import { mapI18nValues } from '../../../service/admin-language-service';
import { type IProductAllergen } from '@nandos-types/model/authoring/menu-entity/product-allergen';
import { type I18NString } from '@nandos-types/model/language';


export default class ProductAllergen extends BaseEntity implements IProductAllergen {

	public name: I18NString;
	public description: I18NString;

	constructor(data: IProductAllergen) {
		super(data);
		this.name = mapI18nValues(data.name)
		this.description = mapI18nValues(data.description)
	}

}