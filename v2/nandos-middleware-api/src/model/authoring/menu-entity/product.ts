import '../../../util/admin-context-guard';
import { BaseEntity } from './internal';
import { mapI18nValues } from '../../../service/admin-language-service';
import { type I18NString } from '@nandos-types/model/language';
import { type IProduct } from '@nandos-types/model/authoring/menu-entity/product';
import { type IProductBadge } from '@nandos-types/model/product-badge';

export default class Product extends BaseEntity implements IProduct {

	public name: I18NString;
	public shortName: I18NString;
	public description: I18NString;
	public deliveryDisclaimer: I18NString;
	public generalDisclaimer: I18NString;
	public badge: ProductBadge;
	public hiddenFromAggregator: boolean;
	public searchBias: number;
	public servingSize: number;
	public accentColor: string;

	constructor(data: IProduct) {
		super(data);
		this.name = mapI18nValues(data.name);
		this.shortName = mapI18nValues(data.shortName);
		this.description = mapI18nValues(data.description);
		this.deliveryDisclaimer = mapI18nValues(data.deliveryDisclaimer);
		this.generalDisclaimer = mapI18nValues(data.generalDisclaimer);
		this.badge = data.badge && new ProductBadge(data.badge);
		this.hiddenFromAggregator = data.hiddenFromAggregator;
		this.searchBias = data.searchBias;
		this.servingSize = data.servingSize;
		this.accentColor = data.accentColor;
	}

}

export class ProductBadge implements IProductBadge {

	public title: I18NString;
	public backgroundColor: string;
	public textColor: string;

	constructor(data: IProductBadge = {
		title: {},
		textColor: '',
		backgroundColor: ''
	}) {
		this.title = mapI18nValues(data.title);
		this.backgroundColor = data.backgroundColor;
		this.textColor = data.textColor;
	}
}