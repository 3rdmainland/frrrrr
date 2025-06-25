import '../../../util/admin-context-guard';
import { BaseEntity } from './internal';
import { mapI18nValues } from '../../../service/admin-language-service';
import { type I18NString } from '@nandos-types/model/language';
import { type TProductNutritionalComponentUnit } from '@nandos-types/model/authoring/menu-entity/product-nutritional-component';
import { type IProductNutritionalComponent } from '@nandos-types/model/authoring/menu-entity/product-nutritional-component';

export default class ProductNutritionalComponent extends BaseEntity implements IProductNutritionalComponent {

	public name: I18NString;
	public description: I18NString;
	public recommendedDailyValue: number;
	public unit: TProductNutritionalComponentUnit;
	public subComponent: boolean;
	public displayOrder: number;

	constructor(data: IProductNutritionalComponent) {
		super(data);
		this.name = mapI18nValues(data.name);
		this.description = mapI18nValues(data.description);
		this.recommendedDailyValue = data.recommendedDailyValue;
		this.unit = data.unit;
		this.subComponent = !!data.subComponent;
		this.displayOrder = data.displayOrder;
	}

}