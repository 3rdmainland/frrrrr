import '../../util/web-context-guard'
import ApiHttp from '../../http'
import AuthService, { AUTH_CHANGED } from '../auth-service'
import CustomerCreditCard from '../../model/customer-credit-card'
import CustomerService, { CUSTOMER_UPDATED, CUSTOMER_CHANGED } from './customer-service'
import MyLanguageService, { LANGUAGE_CHANGED } from '../my-language-service'

const ME = 'me'


class MeService extends CustomerService {

	constructor() {
		super()

		this._meCache = null

		// Drop cache whenever logged in customer's auth changes (might be a new customer)
		AuthService.addObserver(this, AUTH_CHANGED, () => {
			this._meCache = null
			this.notifyObservers(CUSTOMER_UPDATED)
		})
	}

  /**
	 * @override
	 */
	get customerId() {
	  return ME
	}

	getMe() {
		if(this._meCache) return this._meCache
		return this._meCache = super.getCustomer()
			.then(customer => {
				if(['BROCHURE','HOTPLOT_WEB'].includes(process.env.VUE_APP_CONTEXT) == false) { // don't set langs for these contexts
					MyLanguageService.setLanguageFromCustomer(customer)
				}
				return customer
			})
			.catch(e => {
			  this._meCache = null
			  return Promise.reject(e)
			})
	}

	getCustomerInfo() {
		return this.getMe()
	}
	
	isAnonymous() {
		return this.getMe().then(customer => customer.anonymous)
	}

	isVerified() {
		return this.getMe().then(customer => customer.verified)
	}

	updateCustomer(customer) {
		return this._meCache = super.updateCustomer(customer)
	}

	updateLanguagePreference(language) {
		return this._meCache = super.updateLanguagePreference(language)
	}

	getCreditCards() {
		return ApiHttp.get(`/customers/${this.customerId}/cards`)
			.then(response => response.data.cards.map(d => new CustomerCreditCard(d)))
	}

	addCreditCard(creditCard) {
		return ApiHttp.post(`/customers/${this.customerId}/cards`, {creditCard})
			.then(response => new CustomerCreditCard(response.data.transaction.storableCreditCard))
			.then(this._notifyUpdated)
	}

	deleteCreditCard(id) {
		return ApiHttp.delete(`/customers/${this.customerId}/cards/${id}`)
			.then(() => true)
			.then(this._notifyUpdated)
	}

	getInFlightTransactions() {
		return ApiHttp.get(`/modules/payment/inflight`)
			.then(response => response.data.transaction)
	}

	acknowledgeTransaction(transaction) {
		return ApiHttp.post(`/modules/payment/inflight/acknowledge/${transaction.serviceType.toLowerCase()}/${transaction.orderId}`)
			.then(response => response.status == 'success')
	}
}

export default new MeService()

// Re-export for convenience 
export { CUSTOMER_UPDATED, CUSTOMER_CHANGED }