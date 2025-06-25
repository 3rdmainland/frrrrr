import User from './user'

export default class CustomerNote {

	constructor(data = {}) {
		this.id = data.id
    this.type = data.type
    this.customerId = data.customerId
    this.adminUser = data.adminUser && new User(data.adminUser)
		this.note = data.note
	}
}

export const TYPES = ['WARNING', 'BLACKLIST']