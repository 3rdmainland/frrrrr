import { 
	PAYMENT_STATUSES,
	type IPaymentStatus,
	type IPaymentMethods,
	type IPaymentTransaction,
} from "@nandos-types/model/payment-transaction";

export default class PaymentTransaction {

	public status: IPaymentStatus;
	public method: IPaymentMethods;
	public amount: number;

	constructor(data: IPaymentTransaction) {
		//this.providerReference = data.providerReference
		//this.customerId = data.customerId
		//this.saveCard = data.saveCard
		//this.orderId = data.orderId
		//this.cardId = data.cardId
		this.status = PAYMENT_STATUSES[data.status]
		this.method = data.method
		this.amount = data.amount
	}
}