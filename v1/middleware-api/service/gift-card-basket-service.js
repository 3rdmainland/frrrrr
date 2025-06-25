import '../util/web-context-guard'
import Observable from '../util/observable'
import ApiHttp from '../http'
import AuthService, { AUTH_CHANGED } from './auth-service'
import MeService from './customer/me-service';
import GiftCardBasket from '../model/gift-card-basket'
import CardTransaction from '../model/card-transaction'
import GiftCardDesignPreset from '../model/gift-card-design-preset'
import Voucher from '../model/voucher'

export const BASKET_CONTENTS_CHANGED = 'BASKET_CONTENTS_CHANGED'

class GiftCardBasketService extends Observable {

	constructor() {
		super()
		
		this._basketCache = null
		AuthService.addObserver(this, AUTH_CHANGED, () => this._clearCache())
	}

	get customerId() {
    return MeService.customerId
  }

	_processBasketResponse(response) {
		let basket = new GiftCardBasket(response.data.basket)
		this._basketCache = basket
		this.notifyObservers(BASKET_CONTENTS_CHANGED)
		return basket
	}

	getBasket() {
		if(this._basketCache) return Promise.resolve(this._basketCache)

		return ApiHttp.get(`/customers/${this.customerId}/giftcardbasket`)
			.then(response => this._processBasketResponse(response))
	}

	getBasketItem(id) {
		return this.getBasket()
			.then(basket => {
				let card = basket.items.find(card => card.id == id)
				if(card) {
					return card
				}
				else {
					let error = new Error('Card not found in basket')
					error.code = 'NOT_FOUND'
					throw error
				}
			})
	}

	addCard(card) {
		return ApiHttp.post(`/customers/${this.customerId}/giftcardbasket/items`, card)
			.then(response => this._processBasketResponse(response))
	}

	updateCard(card) {
		return ApiHttp.put(`/customers/${this.customerId}/giftcardbasket/items`, card)
			.then(response => this._processBasketResponse(response))
	}

	removeCard(card) {
		return ApiHttp.delete(`/customers/${this.customerId}/giftcardbasket/items/${card.id}`)
			.then(response => this._processBasketResponse(response))
	}

	getPaymentOptions() {
		return ApiHttp.get(`/customers/${this.customerId}/payment/prepare/giftcard`)
			.then(response => response.data.requirements)
	}
	
	setDriverTip(amount){}

	addVoucher(voucherCode) {
		return ApiHttp.post(`/customers/${this.customerId}/payment/voucher/giftcard`, {token: voucherCode})
			.then(response => {
				response.data.transaction.voucher = new Voucher(response.data.transaction.voucher)
				return response.data.transaction
			})
	}
	
	removeVoucher(voucherCode) {
		return ApiHttp.delete(`/customers/${this.customerId}/payment/voucher/giftcard`)
			.then(response => response.data.transaction)
	}

	doCardPayment(walletAmount,ignored, creditCard, saveCard) {
		return this._doPayment(walletAmount, true, creditCard,	saveCard)
	}

	doCashPayment() {
		return Promise.error('Cash payments not supported')
	}

	doWalletPayment(walletAmount) {
		return this._doPayment(walletAmount, false)
	}

	_doPayment(walletAmount, isCreditCardPayment, creditCard, saveCard) {
		let data = {
			walletAmount,
			skipCreditCardPayment: !isCreditCardPayment,
			creditCard,
			saveCard,
		}
		return ApiHttp.post(`/customers/${this.customerId}/payment/initiate/giftcard`, data)
			.then(response =>  new CardTransaction(response.data.transaction))
	}

	paymentCompleted(transaction) {
		if(transaction.success && transaction.completed) {
			this._clearCache()
		}
	}

	/**
	 * Returns presets associated with gift card creation
	 */
	getGiftCardPresets() {
		return ApiHttp.get(`/giftcard/presets`)
			.then(response => {
				response.data.presets.designs.forEach(d => new GiftCardDesignPreset(d))
				return response.data.presets
			})
	}

	_clearCache() {
		this._basketCache = null;
		this.notifyObservers(BASKET_CONTENTS_CHANGED);
	}
}

export default new GiftCardBasketService()