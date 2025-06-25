import logger from 'nandos-dev-logger'
import Observable from '../../util/observable'
import filterToQuery from '../../util/filter-to-query'
import ApiHttp from '../../http'
import Customer from '../../model/customer'
import CustomerAddress from '../../model/customer-address'
import CustomerPastOrder from '../../model/customer-past-order'
import CutomerPastGiftCardOrder from '../../model/customer-past-gift-card-order'
import GiftCard from '../../model/gift-card'

export const CUSTOMER_UPDATED = 'CUSTOMER_UPDATED'
export const CUSTOMER_CHANGED = 'CUSTOMER_CHANGED'

let lastCustomerId = null

export default class CustomerService extends Observable {

	constructor() {
		super()
		this._notifyUpdated = this._notifyUpdated.bind(this)
	}

	get customerId() {
	  throw new Error('Customer Service:: customerId: This method must be implemented by the parent class')
	}

	getCustomer() {
		return ApiHttp.get(`/customers/${this.customerId}`,{withCredentials:true})
			.then(response => {
				let customer = new Customer(response.data.customer)
				if(customer.id != lastCustomerId) {
				  lastCustomerId = customer.id
				  this.notifyObservers(CUSTOMER_CHANGED)
				}
				return customer
			})
	}

	updateCustomer(customer) {
		return ApiHttp.put(`/customers/${this.customerId}`, customer)
			.then(response => new Customer(response.data.customer))
			.then(this._notifyUpdated)
	}

	getGiftCards(filters, pageNumber = 0, pageSize = 10) {
		return ApiHttp.get(`/customers/${this.customerId}/giftcards?pageNumber=${pageNumber}&pageSize=${pageSize}&${filterToQuery(filters)}`)
			.then(response => {
			  response.data.giftcards = response.data.giftcards.map(card => new GiftCard(card))
			  return response.data
			})
	}

	getWallet() {
		return ApiHttp.get(`/customers/${this.customerId}/wallet`)
			.then(response => response.data.wallet)
	}

	getAddresses() {
		return ApiHttp.get(`/customers/${this.customerId}/addresses`)
			.then(response => response.data.addresses.map(d => new CustomerAddress(d)))
	}

	getAddress(addressId) {
		return ApiHttp.get(`/customers/${this.customerId}/addresses/${addressId}`)
			.then(response => new CustomerAddress(response.data.address))
	}

	addAddress(customerAddress) {
		return ApiHttp.post(`/customers/${this.customerId}/addresses`, customerAddress)
			.then(response => new CustomerAddress(response.data.address))
			.then(this._notifyUpdated)
	}

	updateAddress(customerAddress) {
		return ApiHttp.put(`/customers/${this.customerId}/addresses`, customerAddress)
			.then(response => new CustomerAddress(response.data.address))
			.then(this._notifyUpdated)
	}

	deleteAddress(addressId) {
		return ApiHttp.delete(`/customers/${this.customerId}/addresses/${addressId}`)
			.then(() => true)
			.then(this._notifyUpdated)
	}

	getFoodOrders() {
		return ApiHttp.get(`/customers/${this.customerId}/basket/history`)
			.then(response => response.data.baskets.map(order => new CustomerPastOrder(order)))
	}

	getFoodOrder(orderId) {
		return ApiHttp.get(`/customers/${this.customerId}/basket/history/${orderId}`)
			.then(response => new CustomerPastOrder(response.data.basket))
	}

	getFoodOrderInvoice(orderId, email) {
		return ApiHttp.post(`/customers/${this.customerId}/basket/history/${orderId}/invoice`, {email})
      .then(response => response.status == 'success')
	}

	getGiftCardOrders() {
		return ApiHttp.get(`/customers/${this.customerId}/giftcardbasket/history`)
			.then(response => response.data.baskets.map(order => new CutomerPastGiftCardOrder(order)))
	}

	getGiftCardOrder(orderId) {
		return ApiHttp.get(`/customers/${this.customerId}/giftcardbasket/history/${orderId}`)
			.then(response => new CutomerPastGiftCardOrder(response.data.basket))
	}

	getGiftCardOrderInvoice(orderId, email) {
		return ApiHttp.post(`/customers/${this.customerId}/giftcardbasket/history/${orderId}/invoice`, {email})
      .then(response => response.status == 'success')
	}

	resendGiftCardEmail(orderId, cardId, email) {
		return ApiHttp.post(`/customers/${this.customerId}/giftcardbasket/history/${orderId}/resend`, {cardId, email})
      .then(response => response.status == 'success')
	}

	getBehavior() {
		return ApiHttp.get(`/customers/${this.customerId}/behavior`)
			.then(response => response.data.behaviors)
	}

	updateLanguagePreference(language) {
		return ApiHttp.put(`/customers/${this.customerId}/language/${language}`)
			.then(response => new Customer(response.data.customer))
			.then(this._notifyUpdated)
	}

	removeBan() {
		return ApiHttp.delete(`/customers/${this.customerId}/blacklist`)
			.then(response => new Customer(response.data.customer))
			.then(this._notifyUpdated)
	}

	_notifyUpdated(x) { // as a convenience, `_notifyUpdated` passing back whatever argument is passed in to allow chaining
	  this.notifyObservers(CUSTOMER_UPDATED)
	  return x
	}
}