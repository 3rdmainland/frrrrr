export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  FAILURE: 'FAILURE',
  SUCCESS: 'SUCCESS',
  REFUNDED: 'REFUNDED',
  REFUND_REQUESTED: 'REFUND_REQUESTED',
  CANCELLED: 'CANCELLED',
  AWAITING: 'AWAITING',
}

export default class PaymentTransaction {

	constructor(data) {
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