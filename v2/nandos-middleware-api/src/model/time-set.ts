import '../util/admin-context-guard';
import {
	WEEK_DAYS,
	OPERATION_TYPES,
	type ITimeSet,
	type IOperatingDays,
} 
from '@nandos-types/model/time';

const DEFAULT_TIMESET = {
	id: '',
	preset: false,
	base: false,
	name: '',
	days: {
		MONDAY: {
			OPEN: []
		},
		TUESDAY: {
			OPEN: []
		},
		WEDNESDAY: {
			OPEN: []
		},
		THURSDAY: {
			OPEN: []
		},
		FRIDAY: {
			OPEN: []
		},
		SATURDAY: {
			OPEN: []
		},
		SUNDAY: {
			OPEN: []
		}
	}
};

export default class TimeSet {
	
	public id: string;
	public preset: boolean;
	public base: boolean;
	public name: string;
	public days: IOperatingDays;

	constructor(data: ITimeSet = DEFAULT_TIMESET) {
		this.id = data.id
		this.preset = !!data.preset
		this.base = !!data.base
		this.name = data.name
		this.days = data.days
	}

	get isValid() {
		if(!this.days) return false;

		const days = Object.values(this.days);

		// Has a value for each day of the week
		if(!(days && days.length == 7)) return false;

		// Each day has an `OPEN` property and within that has at least 1 time slot
		if(!(days.every(day => day[OPERATION_TYPES.OPEN] && day[OPERATION_TYPES.OPEN]!.length > 0))) return false;

		// All time slots for a given day's `OPEN` hours have a duration greater or equal to 0 (when stores don't trade on a particular day, they set their open and close times to 0)
		if(!(days.every(day => day[OPERATION_TYPES.OPEN] && day[OPERATION_TYPES.OPEN]!.every(timeSlot => timeSlot.close >= timeSlot.open)))) return false;

		return true;
	}

	static getEmptyStoreTimeSetTemplate() {
		const timeSet = new TimeSet();
		timeSet.days = TimeSet.buildDaysTemplate()
		return timeSet;
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
		return (
			WEEK_DAYS.reduce((acc, day) => {
				acc[day] = {
					[OPERATION_TYPES.OPEN]: [{open: 0, close: 0}]
				}
				return acc;
			}, {} as IOperatingDays
		));
	}
}