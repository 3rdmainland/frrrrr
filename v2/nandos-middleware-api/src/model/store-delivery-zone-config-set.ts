import '../util/admin-context-guard';
import StoreDeliveryZoneConfigItem from './store-delivery-zone-config-item';
import { type IStoreDeliveryZoneConfigSet } from '@nandos-types/model/store-delivery-zone-config-set';

export default class StoreDeliveryZoneConfigSet {

  public id: string;
  public name: string;
  public items: StoreDeliveryZoneConfigItem[];
  public base: boolean;
  public adminOnly: boolean;
  public globalOverride: boolean;
  public dateStart: number;
  public dateEnd: number;
  public stores: string[];
  public contexts: string[];

	constructor(data: IStoreDeliveryZoneConfigSet = {
    id: '',
    name: '',
    items: [],
    base: false,
    adminOnly: false,
    globalOverride: false,
    dateStart: 0,
    dateEnd: 0,
    stores: [],
    contexts: []
  }) {
    this.id =  data.id;
    this.name = data.name;
    this.items = (data.items || [])
      .map(i => new StoreDeliveryZoneConfigItem(i))
      .sort((a, b) => a.fromDistance - b.fromDistance);
    this.base = !!data.base;
    this.adminOnly = !!data.adminOnly;
    // System global override type sets have a start/end dates, as well as application contexts they apply to
    this.globalOverride = !!data.globalOverride;
    this.dateStart = data.dateStart;
    this.dateEnd = data.dateEnd;
    this.stores = data.stores;
    this.contexts = data.contexts;
  }
}