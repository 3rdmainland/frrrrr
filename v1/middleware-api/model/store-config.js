import '../util/admin-context-guard'
export default class StoreConfig {

	constructor(data = {}) {
		this.id = data.id
		this.preset = data.preset || false
		this.base = data.base || false
		this.name = data.name
		this.collectionBuffer = data.collectionBuffer
		this.deliveryBuffer = data.deliveryBuffer
		this.maxPerSlot = data.maxPerSlot
		this.prepTime = data.prepTime
		this.slotSize = data.slotSize
		this.orderPriceThreshold = data.orderPriceThreshold
		this.orderPriceIncrement = data.orderPriceIncrement
		this.orderPriceTimePerIncrement = data.orderPriceTimePerIncrement
		this.orderPriceUpperBound = data.orderPriceUpperBound
		this.deliveryDriverLotteryBuffer = data.deliveryDriverLotteryBuffer
	}
}