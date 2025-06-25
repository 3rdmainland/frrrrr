import '../../util/admin-context-guard'
import BasketService from './basket-service'
import FoodBasket from '../../model/food-basket'

const basket = new FoodBasket({})

class InMemoryBasketService extends BasketService {

	constructor() {
		super()
	}

  /**
   * @override
   */
	getBasket() {
		return Promise.resolve(basket)
	}


	/**
   * @override
   */
	getBasketSummary() {
		return Promise.resolve(basket)
	}
}

export default new InMemoryBasketService()

// Re-export base service's constants for convenience 
export { FULFILLMENT_TYPES, BASKET_TIME_SLOT_INTERVAL } from './basket-service'