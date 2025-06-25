import '../../util/admin-context-guard'
import ApiHttp from '../../http'
import AuthService, { AUTH_CHANGED } from '../auth-service'
import CustomerService, { CUSTOMER_UPDATED, CUSTOMER_CHANGED } from './customer-service'
import Customer from '../../model/customer'
import User from '../../model/user'
import CustomerNote from '../../model/customer-note'

class SelectedCustomerService extends CustomerService {

	constructor() {
		super()
		this._customerId = null
		this._selectedCustomerCache = null
	}

	/**
	 * @override
	 */
	get customerId() {
	  return this._customerId
	}

	set customerId(val) {
			let isDifferent = val != this._customerId
		  this._customerId = val
			if(isDifferent) { 
				this._selectedCustomerCache = null
			}
	}


	getCustomerInfo() {
		if(this._selectedCustomerCache) return this._selectedCustomerCache

		return this._selectedCustomerCache = super.getCustomer()
			.catch(e => {
				this._selectedCustomerCache = null
				return Promise.reject(e)
			})
	}
	
	getMe() { return this.getCustomerInfo() }

	updateCustomer(customer) {
		return this._selectedCustomerCache = ApiHttp.put(`/customers`, customer)
			.then(response => new Customer(response.data.customer))
			.then(this._notifyUpdated)
	}

	getNotes() {
		return ApiHttp.get(`/customers/${this.customerId}/notes`)
			.then(response => response.data.notes.map(n => new CustomerNote(n)))
	}

	getNote(id) {
		return ApiHttp.get(`/customers/${this.customerId}/notes/${id}`)
			.then(response => new CustomerNote(response.data.note))
	}

	addNote(note) {
		return ApiHttp.post(`/customers/${this.customerId}/notes`, note)
			.then(response => {
				this._selectedCustomerCache = null // adding a note might cause the customer to be banned - so drop cache
				this.notifyObservers(CUSTOMER_UPDATED)
				return new CustomerNote(response.data.note)
			})
	}

	deleteNote(note) {
		return ApiHttp.delete(`/customers/${this.customerId}/notes/${note.id}`)
			.then(response => {
				this._selectedCustomerCache = null // removing a note might cause the customer to be un-banned - so drop cache
				this.notifyObservers(CUSTOMER_UPDATED)
				return response.status == 'success'
			})
	}

	removeBan() {
		return this._selectedCustomerCache = super.removeBan()
	}
}

export default new SelectedCustomerService()

// Re-export for convenience 
export { CUSTOMER_UPDATED, CUSTOMER_CHANGED }