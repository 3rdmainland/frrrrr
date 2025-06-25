import '../../../util/admin-context-guard';
import { BaseEntity } from './internal';
import { mapI18nValues } from '../../../service/admin-language-service';
import { type ICheckoutInstruction } from '@nandos-types/model/authoring/menu-entity/checkout-instruction';
import { type I18NString } from '@nandos-types/model/language';
import { type TApplicationContext } from '@nandos-types/model/application-context';
import { type TOrderType } from '@nandos-types/model/order';

export default class CheckoutInstruction extends BaseEntity implements ICheckoutInstruction {

	public name: I18NString;
	public description: I18NString;
	public disclaimer: I18NString;
	public displayOrder: number;
	public defaultSelected: boolean;
	public hidden: boolean;

	public firstPurchaseOnly: boolean;
	public minBasketAmount: number;
	public orderTypes: TOrderType[];
	public contexts: TApplicationContext[];
	public allowGuest: boolean;

	constructor(data: ICheckoutInstruction) {
		super(data);
		this.name = mapI18nValues(data.name);
		this.description = mapI18nValues(data.description);
		this.disclaimer = mapI18nValues(data.disclaimer);
		this.displayOrder = data.displayOrder;
		this.defaultSelected = !!data.defaultSelected;
		this.hidden = !!data.hidden;

		// Basket Predicates
		this.firstPurchaseOnly = !!data.firstPurchaseOnly;
		this.minBasketAmount = data.minBasketAmount;
		this.orderTypes = data.orderTypes;
		this.contexts = data.contexts;
		this.allowGuest = data.allowGuest;
	}

}