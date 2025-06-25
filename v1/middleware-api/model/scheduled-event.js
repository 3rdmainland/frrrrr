import { RRule } from 'rrule'

export const SCHEDULE_STATUSES = {
  ACTIVE: 'ACTIVE',
  UPCOMING: 'UPCOMING',
  COMPLETED: 'COMPLETED',
  DISABLED: 'DISABLED',
}

export default class ScheduledEvent {

	constructor(data = {}) {
    if(data === null) data = {}
    this.rrule = data.rrule
    /**
     * int indicates ms offset from start time defined on the rrule.
     * null or undefined indicates "all day" event
     */
    this.duration = data.duration
    this.disabled = !!data.disabled
	}

  get nextOccurrence() {
    if(this.rrule == null || this.disabled == true) return null

    const now = new Date()
    if(this.duration == null || this.duration == 0) now.setHours(0,0,0,0)

    const rule = RRule.fromString(this.rrule)
    const next = rule.after(setPartsToUTCDate(new Date(now.getTime() - (this.duration || 0))), true)
    return next != null ? setUTCPartsToDate(next) : null
  }

  get status() {

    const nextOccurrence = this.nextOccurrence

    if(this.rrule == null)
      return SCHEDULE_STATUSES.ACTIVE
    else if(this.disabled == true)
      return SCHEDULE_STATUSES.DISABLED
    else if(nextOccurrence == null)
      return SCHEDULE_STATUSES.COMPLETED

    const now = new Date()
    const nextOccurrenceIsToday = nextOccurrence.getFullYear() + nextOccurrence.getMonth() + nextOccurrence.getDate() == now.getFullYear() + now.getMonth() + now.getDate()
    const todaysOccurrenceHasStartedYet = nextOccurrenceIsToday && nextOccurrence.getTime() < now.getTime()

    return nextOccurrenceIsToday && todaysOccurrenceHasStartedYet ? SCHEDULE_STATUSES.ACTIVE : SCHEDULE_STATUSES.UPCOMING
  }
}

export function setPartsToUTCDate(d) {
  return new Date(
    Date.UTC(
      d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()
    )
  )
}

export function setUTCPartsToDate(d) {
  return new Date(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()
  )
}