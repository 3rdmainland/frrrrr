import logger from 'nandos-dev-logger'
import ApiHttp from '../../http'
import Observable from '../../util/observable'

export const BEHAVIOR_CHANGED = 'BEHAVIOR_CHANGED'

export default class BehaviorService extends Observable {

	constructor() {
		super()
	}

	get customerId() {
	  throw new Error('Behavior Service:: customerId: This method must be implemented by the parent class')
	}

	applyTo(menu) {
		return this.getBehaviorData()
			.then(behaviorData => {
					
				// Reset user relevance to 0
				menu.products.forEach(product => {
					product.userRelevance = 0
					for(var prop in product.relatedProductsMap) {
						let rp = product.relatedProductsMap[prop]
						rp.userRelevance = 0
					}
				})

				// Apply new user relevance scores
				behaviorData.forEach(behaviour => {
					let product = menu.productMapByDefinitionId[behaviour.productDefinitionId]
					if(product && behaviour.hierarchicalScoreItems) {
						product.applyCustomerBehaviour(behaviour.hierarchicalScoreItems)
					}
				})
				
				return menu
			})
	}

	getBehaviorData() {
		return ApiHttp.get(`/customers/${this.customerId}/behavior`)
			.then(response => response.data.behaviors)
			.catch(e => {
				logger.error('Nandos Middleware', 'getBehaviorData::', e)				
				return []
			})
	}

}