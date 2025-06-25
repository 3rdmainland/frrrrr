import '../../../util/admin-context-guard'
import { BaseEntity } from './internal'
import ScheduledEvent from '../../scheduled-event'

export default class ProductExclusion extends BaseEntity {

	constructor(data) {
		super(data)
		this.schedule = new ScheduledEvent(data.schedule)
		this.type = data.type
		this.adminOnly = data.adminOnly
	}
}

// Re-export for convenience
export { default as EXCLUSION_TYPES } from '../../product-exclusion-types'