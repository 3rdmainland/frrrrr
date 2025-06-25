import '../../../util/admin-context-guard'
import { BaseEntity } from './internal'
import { mapI18nValues } from '../../../service/admin-language-service'
import ScheduledEvent from '../../scheduled-event'

import { TYPES } from '../../system-notification'

export default class SystemNotification extends BaseEntity {

	constructor(data) {
		super(data)
    this.type = TYPES[data.type]
		this.schedule = new ScheduledEvent(data.schedule)
		this.name = mapI18nValues(data.name)		
		this.description = mapI18nValues(data.description)		
		this.link = mapI18nValues(data.link)		
		this.linkText = mapI18nValues(data.linkText)		
		this.youtubeId = mapI18nValues(data.youtubeId)
		this.displayOrder = data.displayOrder
	}

	get linkIsExternal() {
		return Object.entries(this.link)
			.reduce((acc, [key, val]) => {
				acc[key] = val && val.includes('http')
				return acc
			}, {})
	}
}

// Re-export for convenience
export { TYPES }