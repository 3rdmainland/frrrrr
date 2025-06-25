import '../util/admin-context-guard'

export default class StoreDeliveryZoneConfigItem {

	constructor(data = {}) {
    this.fromDistance = data.fromDistance
    this.deliveryPrice = data.deliveryPrice
    this.tradeZonePostCode = data.tradeZonePostCode
  }
}