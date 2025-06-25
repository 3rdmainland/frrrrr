import '../util/admin-context-guard';
import StoreDeliveryZoneConfigSet from './store-delivery-zone-config-set';
import { 
  IStoreDeliveryZone,
  type IGeoPolygon,
  type TStoreDeliveryZoneType 
} from '@nandos-types/model/store-delivery-zone';

export default class StoreDeliveryZone {

  public id: string;
  public storeId: string;
  public name: string;
  public geoPolygon: IGeoPolygon;
  public zoneType: TStoreDeliveryZoneType;
  public configuration: StoreDeliveryZoneConfigSet;
  public startTime: number;
  public endTime: number;

	constructor(data: IStoreDeliveryZone = {
    id: '',
    storeId: '',
    name: '',
    geoPolygon: {
      coordinates: []
    },
    zoneType: 'EXCLUSION',
    configuration: {
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
    },
    startTime: 0,
    endTime: 0
  }) {
    this.id =  data.id;
    this.storeId = data.storeId;
    this.name = data.name;
    this.geoPolygon = data.geoPolygon;
    this.zoneType = data.zoneType; // 'EXCLUSION' or 'INCLUSION'
    this.configuration = data.configuration && new StoreDeliveryZoneConfigSet(data.configuration);
    this.startTime = data.startTime;
    this.endTime = data.endTime;
  }
}