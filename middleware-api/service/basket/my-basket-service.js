import '../../util/web-context-guard'
import ApiHttp from '../../http';
import AuthService, { AUTH_CHANGED } from '../auth-service';
import BasketService, { BASKET_CONTENTS_CHANGED, ORDER_SETUP_CHANGED } from './basket-service';
import MyProductAvailabilityService from '../product-availability/my-product-availability-service'
import MeService from '../customer/me-service';
import { ORDER_TYPES } from '../../model/food-basket';
import CardTransaction from '../../model/card-transaction'
import Voucher from '../../model/voucher'

class MyBasketService extends BasketService {

	constructor() {
		super();

		MyProductAvailabilityService.basketService = this

		this._basketSummaryCache = null

		AuthService.addObserver(this, AUTH_CHANGED, () => {
			this.notifyObservers(ORDER_SETUP_CHANGED)
			this._clearCache()
		})
	}

	/**
	 * @override
	 */
	get customerId() {
    return MeService.customerId
  }

  /**
	 * @override
	 */
	_processBasketResponse(response) {
		let basket = super._processBasketResponse(response)
		
		if(this._basketSummaryCache && this._basketSummaryCache.id != basket.id) {
			this.notifyObservers(ORDER_SETUP_CHANGED)
		}

		const oldBasket = this._basketSummaryCache
		const newBasket = basket

		this._basketSummaryCache = newBasket // make sure new basket is cached before `BASKET_CONTENTS_CHANGED` is dispatched

		if(oldBasket != null && (oldBasket.totalItems != newBasket.totalItems || oldBasket.totalPrice != newBasket.totalPrice)) {
			this.notifyObservers(BASKET_CONTENTS_CHANGED)
		}

		return basket;
	}

	/**
	 * @override
	 */
	getBasket(forceRecheckAvailabilty) {
		if(forceRecheckAvailabilty) MyProductAvailabilityService.forceRecheck()
			
		return super.getBasket()
			.then(basket => MyProductAvailabilityService.applyTo(basket))
	}

	/**
	 * @override
	 */
	getBasketSummary() {
		if(this._basketSummaryCache) return Promise.resolve(this._basketSummaryCache);
		return super.getBasketSummary()
	}

	/**
	 * @override
	 */
	configureOrder(data) {
		console.log('configureOrderFunc', data)
		let {orderType, address} = data

		let addressResolver = (orderType === ORDER_TYPES.DELIVERY)
			? address.id === undefined ? MeService.addAddress(address) : MeService.updateAddress(address) // create/update the address first
			: Promise.resolve()
		
		return addressResolver
      .then(customerAddress => super.configureOrder(Object.assign({customerAddressId: customerAddress && customerAddress.id}, data)))
      .then(basket => this.notifyObservers(ORDER_SETUP_CHANGED))
	}
	
	getPaymentOptions() {
		return ApiHttp.get(`/customers/${this.customerId}/payment/prepare/food`)
			.then(response => response.data.requirements)
	}

	
	addVoucher(voucherCode) {
		return ApiHttp.post(`/customers/${this.customerId}/payment/voucher/food`, {token: voucherCode})
			.then(response => {
				if(response.data.transaction.voucher) {
					response.data.transaction.voucher = new Voucher(response.data.transaction.voucher)
				}
				return response.data.transaction
			})
	}
	
	removeVoucher(voucher) {
		return ApiHttp.delete(`/customers/${this.customerId}/payment/voucher/food/${voucher.reference}`)
			.then(response => response.data.transaction)
	}
	
	doCardPayment(walletAmount,tipAmount, creditCard, saveCard) {
		return this._doPayment(walletAmount,tipAmount, true, creditCard,	saveCard)
	}

	doCashPayment(walletAmount,tipAmount, unpaidOrderPaymentIntent) {
		return this._doPayment(walletAmount,tipAmount, false, null, null, unpaidOrderPaymentIntent)
	}

	doWalletPayment(walletAmount,tipAmount) {
		return this._doPayment(walletAmount,tipAmount, false)
	}

	_doPayment(walletAmount,tipAmount, isCreditCardPayment, creditCard, saveCard, unpaidOrderPaymentIntent) {
		let data = {
			walletAmount,
			tipAmount,
			skipCreditCardPayment: !isCreditCardPayment,
			creditCard,
			saveCard,
			unpaidOrderPaymentIntentId: (unpaidOrderPaymentIntent && unpaidOrderPaymentIntent.id) || null
		}
		return ApiHttp.post(`/customers/${this.customerId}/payment/initiate/food`, data)
			.then(response =>  new CardTransaction(response.data.transaction))
	}

	paymentCompleted(transaction) {
		if(transaction.success && transaction.completed) {
			this._clearCache()
		}
	}

	checkoutWithoutPayment(unpaidOrderPaymentIntent) {
		let path = `/customers/${this.customerId}/basket/order`
		if(unpaidOrderPaymentIntent) path += `?unpaidOrderPaymentIntentId=${unpaidOrderPaymentIntent.id}`
			
		return ApiHttp.post(path)
			.then(response => {
				this._clearCache()
				return this._processBasketResponse(response)
			})
	}

	_clearCache() {
		this._basketSummaryCache = null;
		this.notifyObservers(BASKET_CONTENTS_CHANGED);
	}
}

export default new MyBasketService()

// Re-export base service's constants for convenience 
export { BASKET_CONTENTS_CHANGED, ORDER_SETUP_CHANGED, FULFILLMENT_TYPES, BASKET_TIME_SLOT_INTERVAL } from './basket-service'