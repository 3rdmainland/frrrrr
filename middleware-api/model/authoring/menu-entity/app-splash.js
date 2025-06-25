import '../../../util/admin-context-guard'
import { BaseEntity } from './internal'

export default class AppSplash extends BaseEntity {

	constructor(data) {
		super(data)
    this.active = !!data.active
	}
}