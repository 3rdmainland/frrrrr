/**
 * Types for the order domain
 */

export type OrderEvent = 'orderChanged' | 'orderUpdated';

export type OrderType = 'DELIVERY' | 'COLLECTION' | 'EAT_IN';

export type OrderFulfilmentType = 'ASAP' | 'FUTURE';

export type OrderStatus = 'PLACED' | 'FAILED' | 'FAILOVER' | 'CANCELLED' | 'REFUNDED';

export type OrderFulfilmentStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'FULFILLED';

export type OrderFollowUpStatus = 'CAPTURED' | 'FAILED' | 'PENDING';

export type OrderFailoverStatus = 'PENDING' | 'ACKNOWLEDGED' | 'PROCESSED';

export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUND_REQUESTED' | 'REFUNDED';

export type BasketReviewStatus = 'REVIEWED' | 'IGNORE';

export interface CustomerVehicle {
  make: string;
  model: string;
  color: string;
  registration: string;
  [key: string]: any;
}

export interface Surcharge {
  id: string;
  name: string;
  amount: number;
  [key: string]: any;
}

export interface BasketItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  configuration?: string;
  [key: string]: any;
}

export interface StoreCapacity {
  storeStatus: string;
  expectedTime: number;
  canDeliverToLocation: boolean;
  canKerbsideCollect: boolean;
  [key: string]: any;
}

export interface OrderFulfilmentProgress {
  status: OrderFulfilmentStatus;
  receivedTime?: number;
  preparingTime?: number;
  readyTime?: number;
  fulfilledTime?: number;
  [key: string]: any;
}

export interface KerbsideState {
  status: string;
  acknowledged: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  [key: string]: any;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  [key: string]: any;
}

export interface MatchedCampaign {
  id: string;
  name: string;
  [key: string]: any;
}

export interface Basket {
  id: string;
  totalItems: number;
  totalPrice: number;
  totalVat: number;
  items?: BasketItem[];
  maximumOrderValue: number;
  minimumOrderValue: number;
  customerId: string;
  context: string;
  matchedCampaigns: MatchedCampaign[];
  selectedFreeProductCampaignItem?: string;
  [key: string]: any;
}

export interface FoodBasket extends Basket {
  items?: BasketItem[];
  menuId: string;
  storeCapacity: StoreCapacity;
  storeId: string;
  storeName: string;
  deliveryAddress?: string;
  deliveryPrice?: number;
  customerAddressId?: string;
  orderTime?: number;
  orderType: OrderType;
  fulfillmentType: OrderFulfilmentType;
  kerbsideCollect?: boolean;
  customerVehicle?: CustomerVehicle;
  tableId?: string;
  autoModified?: boolean;
  collectionSearchAddress?: string;
  collectionSearchCoordinates?: string;
  checkoutInstructions?: any[];
  surcharges?: Surcharge[];
  allowGuestCheckout?: boolean;
  [key: string]: any;
}

export interface Order extends FoodBasket {
  isFoodOrder: boolean;
  status?: OrderStatus;
  fulfilmentProgress?: OrderFulfilmentProgress;
  paymentStatus?: PaymentStatus;
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
  followUpStatus?: OrderFollowUpStatus;
  followUpComment?: string;
  customerMobilePhoneNumber?: string;
  failureReason?: string;
  failoverStatus?: OrderFailoverStatus;
  failoverExpiryTime?: number;
  kerbsideState?: KerbsideState;
  paymentTransactions?: PaymentTransaction[];
  reviewComment?: string;
  reviewDeliveryScore?: number;
  reviewFoodScore?: number;
  reviewStatus?: BasketReviewStatus;
  wasGuestCheckout?: boolean;
  customerDeleted?: boolean;
  recallAllowed?: boolean;
  [key: string]: any;
}

export interface OrderFilter {
  storeId?: string;
  customerId?: string;
  orderNumber?: string;
  status?: OrderStatus;
  orderType?: OrderType;
  fromDate?: string;
  toDate?: string;
  [key: string]: any;
}

export interface OrderLog {
  id: string;
  orderId: string;
  timestamp: number;
  message: string;
  level: string;
  [key: string]: any;
}

export interface DriverRecallRequest {
  reason: string;
  notes?: string;
  [key: string]: any;
}