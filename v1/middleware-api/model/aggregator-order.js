export const UBER_EATS = 'uber_eats'
export const MR_DELIVERY = 'mr_delivery'

export const AGGREGATOR_PROVIDERS = {
  UBER_EATS,
  MR_DELIVERY,
}

export default class AggregatorOrder {

  constructor(data) {
    this.id = data.id
    this.orderId = data.orderId
    this.displayId = data.displayId
    this.posReference = data.posReference
    this.aggregatorKey = data.aggregatorKey
    this.orderTime = data.orderTime
    this.customerName = data.customerName
    this.storeId = data.storeId
    this.totalPrice = data.totalPrice
    this.success = data.success
    this.errorMessage = data.errorMessage
  }
}