import '../../util/admin-context-guard'
import ApiHttp from '../../http';
import BasketService, { BASKET_CONTENTS_CHANGED, ORDER_SETUP_CHANGED } from './basket-service';
import SelectedCustomer, { CUSTOMER_CHANGED } from '../customer/selected-customer-service';
import SelectedCustomerProductAvailabilityService from '../product-availability/selected-customer-product-availability-service'
import { ORDER_TYPES } from '../../model/food-basket';
import CustomerPastOrder from '../../model/customer-past-order';


class SelectedCustomerBasketService extends BasketService {

	constructor() {
		super();

		this._basketSummaryCache = null;

		SelectedCustomerProductAvailabilityService.basketService = this

		SelectedCustomer.addObserver(this, CUSTOMER_CHANGED, () => {
			this.notifyObservers(ORDER_SETUP_CHANGED)
			this._clearCache()
		});
	}

  /**
	 * @override
	 */
	get customerId() {
    return SelectedCustomer.customerId
  }

	/**
	 * @override
	 */
	_processBasketResponse(response) {
		let basket = super._processBasketResponse(response);

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
		if(forceRecheckAvailabilty) SelectedCustomerProductAvailabilityService.forceRecheck()
			
		return super.getBasket()
			.then(basket => SelectedCustomerProductAvailabilityService.applyTo(basket))
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
		let {orderType, address} = data

		let addressResolver = (orderType === ORDER_TYPES.DELIVERY)
			? address.id === undefined ? SelectedCustomer.addAddress(address) : SelectedCustomer.updateAddress(address) // create/update the address first
			: Promise.resolve()
		
		return addressResolver
      .then(customerAddress => super.configureOrder(Object.assign({customerAddressId: customerAddress && customerAddress.id}, data)))
      .then(basket => this.notifyObservers(ORDER_SETUP_CHANGED))
	}

	getPersonalBasket() {
		return ApiHttp.get(`/customers/${this.customerId}/basket/personal`)
			.then(response => super._processBasketResponse(response))
	}
	
	retry(orderId) {
		return ApiHttp.post(`/customers/${this.customerId}/basket/retry/${orderId}`)
			.then(response => new CustomerPastOrder(response.data.basket))
	}

	placeOrder() {
		return ApiHttp.post(`/customers/${this.customerId}/basket/order`)
			.then(response => {
				this._processBasketResponse(response);
				return new CustomerPastOrder(response.data.basket)
			})
	}



	_clearCache() {
		this._basketSummaryCache = null;
		this.notifyObservers(BASKET_CONTENTS_CHANGED);
	}
}

export default new SelectedCustomerBasketService();
// Re-export base service's constants for convenience 
export { BASKET_CONTENTS_CHANGED, ORDER_SETUP_CHANGED, FULFILLMENT_TYPES, BASKET_TIME_SLOT_INTERVAL } from './basket-service'