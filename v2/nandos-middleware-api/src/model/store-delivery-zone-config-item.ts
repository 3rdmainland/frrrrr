import '../util/admin-context-guard';
import { type IStoreDeliveryZoneConfigItem } from '@nandos-types/model/store-delivery-zone-config-item';

export default class StoreDeliveryZoneConfigItem {

  public fromDistance: number;
  public deliveryPrice: number;
  public tradeZonePostCode: string;

	constructor(data: IStoreDeliveryZoneConfigItem = {
    fromDistance: 0,
    deliveryPrice: 0,
    tradeZonePostCode: ''
  }) {
    this.fromDistance = data.fromDistance;
    this.deliveryPrice = data.deliveryPrice;
    this.tradeZonePostCode = data.tradeZonePostCode;
  }
}