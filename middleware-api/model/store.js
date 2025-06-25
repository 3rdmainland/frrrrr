import StoreCapacity, { STORE_CAPACITY_STATUS } from './store-capacity'
import StoreFacility from './store-facility'
import ImageCollection from './image-collection'

// Re-export for convenience
export { STORE_CAPACITY_STATUS }

const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

export default class Store {

	constructor(data) {
		this.id = data.id;
		this.idName = data.idName;
		this.name = data.name;
		this.displayName = data.displayName;
		this.distance = data.distance;
		this.capacity = data.capacity && new StoreCapacity(data.capacity);
		this.deliveryCapable = data.deliveryCapable;
		this.callCenterDisabled = data.callCenterDisabled;
		this.eatInCapable = data.eatInCapable;
		this.collectionCapable = data.collectionCapable;
		this.kerbsideCapable = data.kerbsideCapable;
		this.trackingEnabled = !!data.trackingEnabled;
		this.address = data.address;
		this.latitude = data.latitude;
		this.longitude = data.longitude;
		this.phone = data.phone && data.phone.map(pn => pn.split(/[,\/\\]/g)[0]);
		this.imageCollection = new ImageCollection(data.images)
		this.facilities = (data.facilities && data.facilities.map(f => new StoreFacility(f))) || [];
		this.kerbsideInstructions = data.kerbsideInstructions
		this.menuId = data.menuId;
		this.openingTimes = data.openingTimes;
		this.timeZoneOffset = data.timeZoneOffset; // an integer that represents offset from GMT. Eg: ZA would be 2
		this.timezoneDiff = ((new Date().getTimezoneOffset() / 60) + this.timeZoneOffset) * 60 * 60 * 1000 // computes the millisecond difference between user and store timezone
	}

	getStatus() {
		return this.capacity.storeStatus;
	}

	/**
	 * Returns the current time slot for today
	 * @param  {String} type Either 'OPEN', 'DELIVERY' or 'COLLECTION'
	 * @return {Object} An object with open and close dates
	 */
	getActiveTimeSlot(type) {
		let nowInUserTZ = new Date()

		let startOfDayInStoreTZ = new Date(nowInUserTZ.getTime() + this.timezoneDiff)
		startOfDayInStoreTZ.setHours(0)
		startOfDayInStoreTZ.setMinutes(0)
		startOfDayInStoreTZ.setSeconds(0)
		let currentDayInStoreTZ = days[startOfDayInStoreTZ.getDay()].toUpperCase()

		let startOfDayInUserTZ = new Date(startOfDayInStoreTZ.getTime() - this.timezoneDiff)

		let timeSlots = this.openingTimes[currentDayInStoreTZ][type]
		let matchedSlot = timeSlots != null
			? timeSlots.find(slot => slot.close > Date.now() - startOfDayInUserTZ.getTime())
			: null
			
		if(matchedSlot) {
			return {
				open: new Date(startOfDayInUserTZ.getTime() + matchedSlot.open),
				closed: new Date(startOfDayInUserTZ.getTime() + matchedSlot.close)
			}
		}
		else {
			return { open: null, closed: null }
		}
	}
}