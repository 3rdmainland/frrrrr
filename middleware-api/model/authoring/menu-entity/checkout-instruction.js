import '../../../util/admin-context-guard'
import { BaseEntity } from './internal'
import { mapI18nValues } from '../../../service/admin-language-service'

export default class CheckoutInstruction extends BaseEntity {

	constructor(data) {
		super(data)
		this.name = mapI18nValues(data.name)
		this.description = mapI18nValues(data.description)
		this.disclaimer = mapI18nValues(data.disclaimer)
		this.displayOrder = data.displayOrder
		this.defaultSelected = !!data.defaultSelected
		this.hidden = !!data.hidden

		// Basket Predicates
		this.firstPurchaseOnly = !!data.firstPurchaseOnly
		this.minBasketAmount = data.minBasketAmount
		this.orderTypes = data.orderTypes
		this.contexts = data.contexts
		this.allowGuest = data.allowGuest
	}

}