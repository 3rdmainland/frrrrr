import GiftCardBasket from './gift-card-basket';
import PaymentTransaction from './payment-transaction';
import { type ICustomerPastGiftCardOrder } from '@nandos-types/model/customer-past-gift-card-order';
import { ORDER_STATUS, type TOrderStatus } from '@nandos-types/model/order';

export default class CustomerPastGiftCardOrder extends GiftCardBasket implements ICustomerPastGiftCardOrder {
  status: TOrderStatus;
  isGiftCardOrder: boolean;
  invoiceNumber?: number;
  orderPlacedTime?: number;
  orderTime?: number;
  customerMobilePhoneNumber?: string;
  paymentTransactions?: PaymentTransaction[];

  constructor(data: ICustomerPastGiftCardOrder) {
    super(data);
    this.status = ORDER_STATUS[data.status];
    this.isGiftCardOrder = true;
    this.invoiceNumber = data.invoiceNumber;
    this.orderPlacedTime = data.orderPlacedTime;
    this.orderTime = data.orderTime;
    this.customerMobilePhoneNumber = data.customerMobilePhoneNumber;
    this.paymentTransactions = data.paymentTransactions && data.paymentTransactions.map(t => new PaymentTransaction(t));
  }
}