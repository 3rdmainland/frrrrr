import { ORDER_STATUS } from './customer-past-order'
import GiftCardBasket from './gift-card-basket'
import PaymentTransaction from './payment-transaction'

export default class CutomerPastGiftCardOrder extends GiftCardBasket {

	constructor(data) {
    super(data)
    this.status = ORDER_STATUS[data.status]
    this.isGiftCardOrder = true
    this.invoiceNumber = data.invoiceNumber
    this.orderPlacedTime = data.orderPlacedTime
    this.orderTime = data.orderTime
    this.customerMobilePhoneNumber = data.customerMobilePhoneNumber
    this.paymentTransactions = data.paymentTransactions && data.paymentTransactions.map(t => new PaymentTransaction(t))
  }
}