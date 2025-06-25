import '../util/admin-context-guard'
import StoreDeliveryZoneConfigSet from './store-delivery-zone-config-set'

export const ZONE_TYPE_EXCLUSION = 'EXCLUSION'
export const ZONE_TYPE_INCLUSION = 'INCLUSION'

export default class StoreDeliveryZone {

	constructor(data = {}) {
    this.id =  data.id
    this.storeId = data.storeId
    this.name = data.name
    this.geoPolygon = data.geoPolygon
    this.zoneType = data.zoneType // 'EXCLUSION' or 'INCLUSION'
    this.configuration = data.configuration && new StoreDeliveryZoneConfigSet(data.configuration)
    this.startTime = data.startTime
    this.endTime = data.endTime
  }
}