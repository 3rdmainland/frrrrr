export const KERBSIDE_STATUSES = {
  AWAITING: 'AWAITING',
  CUSTOMER_DEPARTED : 'CUSTOMER_DEPARTED',
  CUSTOMER_ARRIVED : 'CUSTOMER_ARRIVED',
  ASSISTANCE_REQUIRED : 'ASSISTANCE_REQUIRED',
  FULFILLED : 'FULFILLED',
}

export default class KerbsideState {

	constructor(data = {}) {
		this.status = data.status
		this.distance = data.distance
		this.acknowledged = data.acknowledged
	}
}