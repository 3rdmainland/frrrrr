import Observable from '../../util/observable'
import filterToQuery from '../../util/filter-to-query'
import ApiHttp from '../../http'
import Customer from '../../model/customer'
import CustomerAddress from '../../model/customer-address'
import CustomerPastOrder from '../../model/customer-past-order'
import CustomerPastGiftCardOrder from '../../model/customer-past-gift-card-order'
import GiftCard from '../../model/gift-card'
import { AxiosResponse } from 'axios'
import { ICustomer } from "@nandos-types/model/customer";
import { ICustomerAddress } from "@nandos-types/model/customer-address";
import { IGiftCard } from "@nandos-types/model/gift-card";
import { ICustomerPastOrder } from "@nandos-types/model/customer-past-order";
import { ICustomerPastGiftCardOrder } from "@nandos-types/model/customer-past-gift-card-order";

export const CUSTOMER_UPDATED = 'CUSTOMER_UPDATED'
export const CUSTOMER_CHANGED = 'CUSTOMER_CHANGED'

let lastCustomerId:string|null = null

export default class CustomerService extends Observable {

	constructor() {
		super()
		this._notifyUpdated = this._notifyUpdated.bind(this)
	}

	get customerId(): string {
	  throw new Error('Customer Service:: customerId: This method must be implemented by the parent class')
	}

	getCustomer(): Promise<Customer> {
		return ApiHttp.get(`/customers/${this.customerId}`, {withCredentials: true})
			.then(response => {
				let customer = new Customer(response.data.customer)
				if(String(customer.id) !== lastCustomerId) {
					lastCustomerId = String(customer.id)
					this.notifyObservers(CUSTOMER_CHANGED)
				}
				return customer
			})
	}

	updateCustomer(customer: Partial<ICustomer>): Promise<Customer> {
		return ApiHttp.put(`/customers/${this.customerId}`, customer)
			.then(response => new Customer(response.data.customer))
			.then(this._notifyUpdated)
	}

	getGiftCards(filters: Record<string, any>, pageNumber = 0, pageSize = 10):Promise<{giftcards: GiftCard[]}> {
		return ApiHttp.get(`/customers/${this.customerId}/giftcards?pageNumber=${pageNumber}&pageSize=${pageSize}&${filterToQuery(filters)}`)
			.then(response => {
			  response.data.giftcards = response.data.giftcards.map((card: Partial<IGiftCard>) => new GiftCard(card))
			  return response.data
			})
	}

	getWallet(): Promise<any> {
		return ApiHttp.get(`/customers/${this.customerId}/wallet`)
			.then(response => response.data.wallet)
	}

	getAddresses(): Promise<CustomerAddress[]> {
		return ApiHttp.get(`/customers/${this.customerId}/addresses`)
			.then(response => response.data.addresses.map((d: Partial<ICustomerAddress>) => new CustomerAddress(d)))
	}

	getAddress(addressId: string): Promise<CustomerAddress> {
		return ApiHttp.get(`/customers/${this.customerId}/addresses/${addressId}`)
			.then(response => new CustomerAddress(response.data.address))
	}

	addAddress(customerAddress: Partial<ICustomerAddress>): Promise<CustomerAddress> {
		return ApiHttp.post(`/customers/${this.customerId}/addresses`, customerAddress)
			.then(response => new CustomerAddress(response.data.address))
			.then(this._notifyUpdated)
	}

	updateAddress(customerAddress: Partial<ICustomerAddress>): Promise<CustomerAddress> {
		return ApiHttp.put(`/customers/${this.customerId}/addresses`, customerAddress)
			.then(response => new CustomerAddress(response.data.address))
			.then(this._notifyUpdated)
	}

	deleteAddress(addressId: string): Promise<boolean> {
		return ApiHttp.delete(`/customers/${this.customerId}/addresses/${addressId}`)
			.then(() => true)
			.then(this._notifyUpdated)
	}

	getFoodOrders(): Promise<CustomerPastOrder[]> {
		return ApiHttp.get(`/customers/${this.customerId}/basket/history`)
			.then(response => response.data.baskets.map((order: Partial<ICustomerPastOrder>) => new CustomerPastOrder(order)))
	}

	getFoodOrder(orderId: string): Promise<CustomerPastOrder> {
		return ApiHttp.get(`/customers/${this.customerId}/basket/history/${orderId}`)
			.then(response => new CustomerPastOrder(response.data.basket))
	}

	getFoodOrderInvoice(orderId: string, email: string): Promise<boolean> {
		return ApiHttp.post(`/customers/${this.customerId}/basket/history/${orderId}/invoice`, {email})
			.then((response: AxiosResponse<{ status: string }>) => response.data.status === 'success')
	}

	getGiftCardOrders(): Promise<CustomerPastGiftCardOrder[]> {
		return ApiHttp.get(`/customers/${this.customerId}/giftcardbasket/history`)
			.then(response => response.data.baskets.map((order: Partial<ICustomerPastGiftCardOrder>) => new CustomerPastGiftCardOrder(order)))
	}

	getGiftCardOrder(orderId: string): Promise<CustomerPastGiftCardOrder> {
		return ApiHttp.get(`/customers/${this.customerId}/giftcardbasket/history/${orderId}`)
			.then(response => new CustomerPastGiftCardOrder(response.data.basket))
	}

	getGiftCardOrderInvoice(orderId: string, email: string): Promise<boolean> {
		return ApiHttp.post(`/customers/${this.customerId}/giftcardbasket/history/${orderId}/invoice`, {email})
			.then((response: AxiosResponse<{ status: string }>) => response.data.status === 'success')
	}

	resendGiftCardEmail(orderId: string, cardId: string, email: string): Promise<boolean> {
		return ApiHttp.post(`/customers/${this.customerId}/giftcardbasket/history/${orderId}/resend`, {cardId, email})
			.then((response: AxiosResponse<{ status: string }>) => response.data.status === 'success')
	}

	getBehavior(): Promise<any> {
		return ApiHttp.get(`/customers/${this.customerId}/behavior`)
			.then(response => response.data.behaviors)
	}

	updateLanguagePreference(language: string): Promise<Customer> {
		return ApiHttp.put(`/customers/${this.customerId}/language/${language}`)
			.then(response => new Customer(response.data.customer))
			.then(this._notifyUpdated)
	}

	removeBan(): Promise<Customer> {
		return ApiHttp.delete(`/customers/${this.customerId}/blacklist`)
			.then(response => new Customer(response.data.customer))
			.then(this._notifyUpdated)
	}

	_notifyUpdated<T>(x: T): T { // as a convenience, `_notifyUpdated` passing back whatever argument is passed in to allow chaining
		this.notifyObservers(CUSTOMER_UPDATED)
		return x
	}
}
