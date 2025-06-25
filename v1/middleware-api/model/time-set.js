import '../util/admin-context-guard'

export const OPEN_KEY = 'OPEN'
export const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

export default class TimeSet {

	constructor(data = {}) {
		this.id = data.id
		this.preset = !!data.preset
		this.base = !!data.base
		this.name = data.name
		this.days = data.days
	}

	get isValid() {
		if(!this.days) return false

	  let days = Object.values(this.days)

	  // Has a value for each day of the week
	  if(!(days && days.length == 7)) return false

	  // Each day has an `OPEN` property and within that has at least 1 time slot
	  if(!(days.every(day => day[OPEN_KEY] && day[OPEN_KEY].length > 0))) return false

	  // All time slots for a given day's `OPEN` hours have a duration greater or equal to 0 (when stores don't trade on a particular day, they set their open and close times to 0)
	  if(!(days.every(day => day[OPEN_KEY].every(timeSlot => timeSlot.close >= timeSlot.open)))) return false

	  return true
	}

	static getEmptyStoreTimeSetTemplate() {
		let set = new TimeSet()
		set.days = TimeSet.buildDaysTemplate()
		return set
	}

	/**
	 * 👹💀 Return madness in the shape of:
	 * {
	 *   MODAY: {
	 *     OPEN: [
	 *       { open: 123, close: 456 }
	 *     ]
	 *   },
	 *   TUESDAY: ...
	 *   WEDNESDAY: ...
	 *   ...
	 * }
	 */
	static buildDaysTemplate() {
		return WEEK_DAYS.reduce((acc, day) => {
			acc[day] ={[OPEN_KEY]: [{open: 0, close: 0}]}
			return acc
		}, {})
	}
}