import Basket from './basket';
import FoodBasketItem from './food-basket-item';
import StoreCapacity from './store-capacity';
import { STORE_CAPACITY_STATUS } from '@nandos-types/model/store-capacity';
import { type ICustomerVehicle } from '@nandos-types/model/customer';
import { 
  type ISurcharge, 
  type IFoodBasket
} from '@nandos-types/model/food-basket';
import {
  ORDER_TYPES, 
  type TOrderType, 
  type TOrderFulfilmentType, 
} from '@nandos-types/model/order';

export { ORDER_TYPES };

export default class FoodBasket extends Basket {

  public items?: FoodBasketItem[];
  public menuId: string;
  public storeCapacity: StoreCapacity;
  public storeId: string;
  public storeName: string;
  public deliveryAddress: string;
  public deliveryPrice: number;
  public customerAddressId: string;
  public orderTime: number;
  public orderType: TOrderType;
  public fulfillmentType: TOrderFulfilmentType;
  public kerbsideCollect: boolean;
  public customerVehicle: ICustomerVehicle;
  public tableId: string;
  public autoModified: boolean;
  public collectionSearchAddress: string;
  public collectionSearchCoordinates: string;
  public checkoutInstructions: any[];
  public surcharges: ISurcharge[];
  public allowGuestCheckout: boolean;
  public selectedFreeProductCampaignItem: string;

  constructor(data: IFoodBasket) {
    super(data);

    this.items = data.basketItems && data.basketItems.map(i => new FoodBasketItem(i)) || [];
    this.menuId = data.menuId;
    this.storeCapacity = (data.storeCapacity && new StoreCapacity(data.storeCapacity)) || {};
    this.storeId = data.storeId;
    this.storeName = data.storeName;
    this.deliveryAddress = data.deliveryAddress;
    this.deliveryPrice = data.deliveryPrice;
    this.customerAddressId = data.customerAddressId;
    this.orderTime = data.orderTime; // Number(Epoch time)
    this.orderType = ORDER_TYPES[data.orderType];
    this.fulfillmentType = data.fulfillmentType; // ASAP || FUTURE
    this.kerbsideCollect = data.kerbsideCollect || false;
    this.customerVehicle = data.customerVehicle;
    this.tableId = data.tableId;
    this.autoModified = data.autoModified;
    this.collectionSearchAddress = data.collectionSearchAddress;
    this.collectionSearchCoordinates = data.collectionSearchCoordinates;
    this.checkoutInstructions = data.checkoutInstructions;
    this.surcharges = data.surcharges || [];
    this.allowGuestCheckout = data.allowGuestCheckout;
    this.selectedFreeProductCampaignItem = data.selectedFreeProductCampaignItem;
  }

  /**
   * @override
   */
  get exceedsMaximumOrderValue () {
    return this.totalPrice - (this.deliveryPrice || 0) > this.maximumOrderValue;
  }

  /**
   * @override
   */
  get underMinimumOrderValue () {
    return this.totalPrice - (this.deliveryPrice || 0) < this.minimumOrderValue;
  }

  get forDelivery () {
    return this.orderType === ORDER_TYPES.DELIVERY;
  }

  get forCollection () {
    return this.orderType === ORDER_TYPES.COLLECTION;
  }

  get forEatIn () {
    return this.orderType === ORDER_TYPES.EAT_IN;
  }

  get isOrderSetup () {
    if(this.storeId == null || this.orderType == null)
      return false;
    if(this.orderType == ORDER_TYPES.DELIVERY && this.deliveryAddress == null)
      return false;
    if(this.orderType == ORDER_TYPES.EAT_IN && this.tableId == null)
      return false;

    return true;
  }

  get expectedReadyTime () {
    return this.storeCapacity
        ? new Date(this.storeCapacity.expectedTime)
        : ''
  }

  get timeUntilOrderReady () {
    return this.storeCapacity
        ? Math.ceil((this.storeCapacity.expectedTime - Date.now()) / 1000 / 60)
        : 0;
  }

  get allItemsAvailable() {
    if (this.items) {
      return this.items.every(item => item.allItemsAvailable);
    }
    return false;
  }

  get orderSetupIssue() {
    if(this.storeCapacity.storeStatus == STORE_CAPACITY_STATUS.AVAILABLE) {
      if(this.orderType === ORDER_TYPES.DELIVERY) {
        return this.storeCapacity.canDeliverToLocation == true
          ? null
          : 'UNABLE_TO_DELIVER_TO_LOCATION';
      }
      else {
        return this.kerbsideCollect == true && this.storeCapacity.canKerbsideCollect == false
          ? 'KERBSIDE_COLLECTION_UNAVAILABLE'
          : null;
      }
    }
    else if(this.storeCapacity.storeStatus === STORE_CAPACITY_STATUS.OFFLINE)
      return STORE_CAPACITY_STATUS.OFFLINE;
    else if(this.storeCapacity.storeStatus === STORE_CAPACITY_STATUS.CLOSED)
      return STORE_CAPACITY_STATUS.CLOSED;
    else
      return 'UNKNOWN';
  }

  get canCheckout() {
    return !this.isEmpty && this.isOrderSetup && this.orderSetupIssue == null && !this.exceedsMaximumOrderValue && !this.underMinimumOrderValue && this.allItemsAvailable;
  }
}
