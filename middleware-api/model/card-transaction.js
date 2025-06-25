export default class CardTransaction {

	constructor(data = {}) {
    this.webFlow = data.webFlow
    this.success = !!data.success
    this.completed = !!data.completed
    this.expired = !!data.expired
    this.resultCode = data.resultCode
    this.resultMessage = data.resultMessage
    this.orderId = data.orderId
    this.serviceType = data.serviceType
	}
}