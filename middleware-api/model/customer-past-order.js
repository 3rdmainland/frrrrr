import FoodBasket from "./food-basket";
import PaymentTransaction, { PAYMENT_STATUSES } from "./payment-transaction";
import OrderFulfilmentProgress, {
  PROGRESS_STATUSES,
} from "./order-fulfilment-progress";
import KerbsideState from "./kerbside-state";

export const ORDER_STATUS = {
  ACTIVE: "ACTIVE",
  PLACED: "PLACED",
  FAILED: "FAILED",
  QUEUED: "QUEUED",
  FAILOVER: "FAILOVER",
};

export const ORDER_FOLLOW_UP_STATUSES = {
  OPENED: "OPENED",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
  CAPTURED: "CAPTURED",
};

export const ORDER_FAILOVER_STATUS = {
  AWAITING: "AWAITING",
  ACKNOWLEDGED: "ACKNOWLEDGED",
  PROCESSED: "PROCESSED",
};

export default class CustomerPastOrder extends FoodBasket {
  constructor(data) {
    super(data);
    this.isFoodOrder = true;
    this.status = ORDER_STATUS[data.status];
    this.fulfilmentProgress =
      data.fulfilmentProgress &&
      new OrderFulfilmentProgress(data.fulfilmentProgress);
    this.paymentStatus = PAYMENT_STATUSES[data.paymentStatus];
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
    this.followUpStatus = ORDER_FOLLOW_UP_STATUSES[data.followUpStatus];
    this.followUpComment = data.followUpComment;
    this.customerMobilePhoneNumber = data.customerMobilePhoneNumber;
    this.failureReason = data.failureReason;
    this.failoverStatus = ORDER_FAILOVER_STATUS[data.failoverStatus];
    this.failoverExpiryTime = data.failoverExpiryTime;
    this.kerbsideState =
      data.kerbsideState && new KerbsideState(data.kerbsideState);
    this.paymentTransactions =
      data.paymentTransactions &&
      data.paymentTransactions.map((t) => new PaymentTransaction(t));

    this.reviewComment = data.reviewComment;
    this.reviewDeliveryScore = data.reviewDeliveryScore;
    this.reviewFoodScore = data.reviewFoodScore;
    this.reviewStatus = data.reviewStatus;
    this.wasGuestCheckout = !!data.wasGuestCheckout;
    this.customerDeleted = !!data.customerDeleted;
    this.recallAllowed = !!data.recallAllowed;
  }

  // An order "is late" when the current time is past the time the order was supposed to be delivered/collected
  get isLate() {
    return Date.now() > this.orderExpectedTime;
  }

  // An order that has not been fulfilled yet
  get isActiveOrder() {
    return (
      this.fulfilmentProgress != null &&
      this.fulfilmentProgress.status != PROGRESS_STATUSES.FULFILLED
    ); /*&& this.status != ORDER_STATUS.FAILED*/
  }

  get isFailoverAcknowledged() {
    return (
      this.status == ORDER_STATUS.FAILOVER &&
      this.failoverStatus == ORDER_FAILOVER_STATUS.ACKNOWLEDGED
    );
  }

  get isKerbsideAcknowledged() {
    return this.kerbsideState && this.kerbsideState.acknowledged == true;
  }

  get wasFailedThenPlaced() {
    return (
      this.status == ORDER_STATUS.PLACED &&
      (this.followUpStatus == ORDER_FOLLOW_UP_STATUSES.CAPTURED ||
        this.failoverStatus == ORDER_FAILOVER_STATUS.PROCESSED)
    );
  }

  // Returns a computed payment status suitable to display to a user
  get displayPaymentStatus() {
    if (
      this.paymentStatus == PAYMENT_STATUSES.REFUND_REQUESTED ||
      this.paymentStatus == PAYMENT_STATUSES.REFUNDED
    )
      return this.paymentStatus;
    else if (this.isFullyPaid) return "PAID";
    else if (this.isUnpaid) return "UNPAID";
    else if (this.isPartiallyPaid) return "PARTIALLY_PAID";
    else return this.paymentStatus;
  }

  get paidAmount() {
    if (!this.paymentTransactions) return 0;

    return this.paymentTransactions
      .filter((t) => t.status == PAYMENT_STATUSES.SUCCESS)
      .filter((t) => t.method != "VOUCHER_CAMPAIGN")
      .reduce((acc, t) => (acc += t.amount), 0);
  }

  get isUnpaid() {
    return this.paidAmount == 0;
  }

  get isFullyPaid() {
    return this.paidAmount > 0 && this.paidAmount >= this.totalPrice;
  }

  get isPartiallyPaid() {
    return this.paidAmount > 0 && !this.isUnpaid && !this.isFullyPaid;
  }

  get hasReview() {
    return this.reviewStatus == "REVIEWED";
  }
}

// Re-export for convenience
export { PAYMENT_STATUSES } from "./payment-transaction";
