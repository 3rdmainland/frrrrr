export const PENDING = 'PENDING'
export const ACCEPTED = 'ACCEPTED'
export const PREPARING = 'PREPARING'
export const PREPARED = 'PREPARED'
export const COLLECTION_READY = 'COLLECTION_READY'
export const DELIVERY_PENDING = 'DELIVERY_PENDING'
export const DELIVERY_ACCEPTED = 'DELIVERY_ACCEPTED'
export const DELIVERY_DEPARTED = 'DELIVERY_DEPARTED'
export const DELIVERY_ARRIVED = 'DELIVERY_ARRIVED'
export const FULFILLED = 'FULFILLED'

export const PROGRESS_STATUSES = {
	PENDING,
	ACCEPTED,
	PREPARING,
	PREPARED,
	COLLECTION_READY,
	DELIVERY_PENDING,
	DELIVERY_ACCEPTED,
	DELIVERY_DEPARTED,
	DELIVERY_ARRIVED,
	FULFILLED,
}

export default class OrderFulfilmentProgress {

	constructor(data) {
    this.status = data.status
    this.deliveryTrackingUrl = data.deliveryTrackingUrl
	}
}