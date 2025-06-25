import '../util/admin-context-guard'
import StoreDeliveryZoneConfigItem from './store-delivery-zone-config-item'

export default class StoreDeliveryZoneConfigSet {

	constructor(data = {}) {
    this.id =  data.id
    this.name = data.name
    this.items = (data.items || [])
    	.map(i => new StoreDeliveryZoneConfigItem(i))
    	.sort((a, b) => a.fromDistance - b.fromDistance)
    this.base = !!data.base
    this.adminOnly = !!data.adminOnly
    // System global override type sets have a start/end dates, as well as application contexts they apply to
    this.globalOverride = !!data.globalOverride
    this.dateStart = data.dateStart
    this.dateEnd = data.dateEnd
    this.stores = data.stores
    this.contexts = data.contexts
  }
}