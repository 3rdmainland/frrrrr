import '../../../util/admin-context-guard';
import ImageData from '../../image-data';
import { BaseEntity } from './internal';
import { mapI18nValues } from '../../../service/admin-language-service';
import type { I18NObject, I18NString } from '@nandos-types/model/language';
import type { IProductFeature } from '@nandos-types/model/authoring/menu-entity/product-feature';

export default class ProductFeature extends BaseEntity implements IProductFeature {

	public name: I18NString;
	public description: I18NString;
	public icon: I18NObject<ImageData>;

	constructor(data: IProductFeature) {
		super(data)
		this.name = mapI18nValues(data.name)
		this.description = mapI18nValues(data.description)
		this.icon = mapI18nValues(data.icon, icon => new ImageData(icon))
	}

}