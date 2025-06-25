import logger from 'nandos-dev-logger'
import ApiHttp from '../../http'
import Observable from '../../util/observable'
import { CUSTOMER_UPDATED } from '../customer/customer-service'


export const PREFERENCE_CHANGED = 'PREFERENCE_CHANGED'

export default class PreferenceService extends Observable {

	constructor() {
		super()
		
		this.customerService.addObserver(this, CUSTOMER_UPDATED, () => this.notifyObservers(PREFERENCE_CHANGED))
	}

	get customerService() {
		throw new Error('This must be implemented by the parent class. Each preference service must provide the appropriate customer service instance to use')
	}

	applyTo(menu) {
		return this.getPreferenceData()
			.then(preferences => {
				// Apply/Clear flavour preferences on products
				const flavourPreference = preferences && preferences.flavour
				menu.products.forEach(product => product.userFlavourPreference = flavourPreference)
				
				// Apply to any existing UserProduct instances (cached in menu categories)
				Object.values(menu.categoryMap).forEach(cat => cat.products.forEach(up => up.applyUserFlavourPreference(true)))
				
				return menu
			})
	}

	getPreferenceData() {
		return this.customerService.getCustomerInfo()
			.then(customer => customer.preferences)
	}

}