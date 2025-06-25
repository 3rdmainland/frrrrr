import FoodBasket from './food-basket';
import PaymentTransaction from './payment-transaction';
import OrderFulfilmentProgress from './order-fulfilment-progress';
import KerbsideState from './kerbside-state';
import { 
  ICustomerPastOrder,
} from '@nandos-types/model/customer-past-order';
import { 
  ORDER_FAILOVER_STATUS, 
  ORDER_FOLLOW_UP_STATUSES, 
  ORDER_FULFILMENT_STATUS, 
  ORDER_STATUS, PAYMENT_STATUSES, 
  type TBasketReviewStatus, 
  type TOrderFailoverStatus, 
  type TOrderFollowUpStatus, 
  type TOrderStatus,
  type IPaymentStatus,
} from '@nandos-types/index';


export default class CustomerPastOrder extends FoodBasket implements ICustomerPastOrder {
  isFoodOrder: boolean;
  status?: TOrderStatus;
  fulfilmentProgress?: OrderFulfilmentProgress;
  paymentStatus?: IPaymentStatus;
  unpaidOrderPaymentIntentId?: string;
  orderNumber?: string;
  orderPlacedTime?: number;
  orderExpectedTime?: number;
  orderRefundedTime?: number;
  refundComment?: string;
  refundedBy?: string;
  placedByAdminId?: string;
  orderSlotTime?: number;
  callCenterOrder?: boolean;
  followUpStatus?: TOrderFollowUpStatus;
  followUpComment?: string;
  customerMobilePhoneNumber?: string;
  failureReason?: string;
  failoverStatus?: TOrderFailoverStatus;
  failoverExpiryTime?: number;
  kerbsideState?: KerbsideState;
  paymentTransactions?: PaymentTransaction[];
  reviewComment?: string;
  reviewDeliveryScore?: number;
  reviewFoodScore?: number;
  reviewStatus?: TBasketReviewStatus;
  wasGuestCheckout: boolean;
  customerDeleted: boolean;
  recallAllowed: boolean;

  constructor(data: ICustomerPastOrder) {
    super(data);

    this.isFoodOrder = true;
    this.status = ORDER_STATUS[data.status as keyof typeof ORDER_STATUS];
    this.fulfilmentProgress = data.fulfilmentProgress && new OrderFulfilmentProgress(data.fulfilmentProgress);
    this.paymentStatus = PAYMENT_STATUSES[data.paymentStatus as keyof typeof PAYMENT_STATUSES];
    this.unpaidOrderPaymentIntentId = data.unpaidOrderPaymentIntentId;
    this.orderNumber = data.orderNumber;
    this.orderPlacedTime = data.orderPlacedTime; // the last time the basket was processed (either placed/failed)
    this.orderExpectedTime = data.orderExpectedTime; // target "food ready" time (closet available slot)
    this.orderRefundedTime = data.orderRefundedTime;
    this.refundComment = data.refundComment;
    this.refundedBy = data.refundedBy;
    this.placedByAdminId = data.placedByAdminId;
    this.orderSlotTime = data.orderSlotTime; // the time at which the order should be in the kitchen being prepared
    this.callCenterOrder = data.callCenterOrder;
    this.followUpStatus = ORDER_FOLLOW_UP_STATUSES[data.followUpStatus as keyof typeof ORDER_FOLLOW_UP_STATUSES];
    this.followUpComment = data.followUpComment;
    this.customerMobilePhoneNumber = data.customerMobilePhoneNumber;
    this.failureReason = data.failureReason;
    this.failoverStatus = ORDER_FAILOVER_STATUS[data.failoverStatus as keyof typeof ORDER_FAILOVER_STATUS];
    this.failoverExpiryTime = data.failoverExpiryTime;
    this.kerbsideState = data.kerbsideState && new KerbsideState(data.kerbsideState);
    this.paymentTransactions = data.paymentTransactions && data.paymentTransactions.map(t => new PaymentTransaction(t));

    this.reviewComment = data.reviewComment;
    this.reviewDeliveryScore = data.reviewDeliveryScore;
    this.reviewFoodScore = data.reviewFoodScore;
    this.reviewStatus = data.reviewStatus;
    this.wasGuestCheckout = !!data.wasGuestCheckout;
    this.customerDeleted = !!data.customerDeleted;
    this.recallAllowed = !!data.recallAllowed;
  }

  // An order "is late" when the current time is past the time the order was supposed to be delivered/collected
  get isLate(): boolean {
    return Date.now() > (this.orderExpectedTime || 0);
  }

  // An order that has not been fulfilled yet
  get isActiveOrder(): boolean {
    return (this.fulfilmentProgress != null && this.fulfilmentProgress.status != ORDER_FULFILMENT_STATUS.FULFILLED);
  }

  get isFailoverAcknowledged(): boolean {
    return this.status == ORDER_STATUS.FAILOVER && this.failoverStatus == ORDER_FAILOVER_STATUS.ACKNOWLEDGED;
  }

  get isKerbsideAcknowledged(): boolean {
    return this.kerbsideState != null && this.kerbsideState.acknowledged == true;
  }

  get wasFailedThenPlaced(): boolean {
    return this.status == ORDER_STATUS.PLACED && (this.followUpStatus == ORDER_FOLLOW_UP_STATUSES.CAPTURED || this.failoverStatus == ORDER_FAILOVER_STATUS.PROCESSED);
  }

  // Returns a computed payment status suitable to display to a user
  get displayPaymentStatus(): string {
    if (this.paymentStatus == PAYMENT_STATUSES.REFUND_REQUESTED || this.paymentStatus == PAYMENT_STATUSES.REFUNDED)
      return this.paymentStatus;
    else if (this.isFullyPaid)
      return 'PAID';
    else if (this.isUnpaid)
      return 'UNPAID';
    else if (this.isPartiallyPaid)
      return 'PARTIALLY_PAID';
    else
      return this.paymentStatus || '';
  }

  get paidAmount(): number {
    if (!this.paymentTransactions) return 0;

    return this.paymentTransactions
      .filter(t => t.status == PAYMENT_STATUSES.SUCCESS)
      .filter(t => t.method != "VOUCHER_CAMPAIGN")
      .reduce((acc, t) => acc += (t.amount || 0), 0);
  }

  get isUnpaid(): boolean {
    return this.paidAmount == 0;
  }

  get isFullyPaid(): boolean {
    return this.paidAmount > 0 && this.paidAmount >= (this.totalPrice || 0);
  }

  get isPartiallyPaid(): boolean {
    return this.paidAmount > 0 && !this.isUnpaid && !this.isFullyPaid;
  }

  get hasReview(): boolean {
    return this.reviewStatus == 'REVIEWED';
  }
}