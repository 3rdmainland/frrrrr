import '../../util/admin-context-guard'
import MenuService, { MENU_CHANGED } from './menu-service'
import BehaviorService, { BEHAVIOR_CHANGED } from '../customer-behavior/selected-customer-behavior-service'
import SelectedCustomerPreferenceService, { PREFERENCE_CHANGED } from '../customer-preference/selected-customer-preference-service'
import BasketService from '../basket/selected-customer-basket-service'
import PromotionsService from '../promotions-service'
import SelectedCustomerProductAvailabilityService, { AVAILABILITY_CHANGED } from '../product-availability/selected-customer-product-availability-service'

class SelectedCustomerMenuService extends MenuService {

	constructor() {
		super()
		this.lastMenuId = null

		this.menuPostProcessingCompleted = false // indicates whether product availability and behaviour data has been applied to menu yet
		this._postProcessPromise = null

		SelectedCustomerProductAvailabilityService.menuService = this

		SelectedCustomerPreferenceService.addObserver(this, PREFERENCE_CHANGED, () => {
			super._getMenu()
				.then(menu => SelectedCustomerPreferenceService.applyTo(menu))
				.then(menu => this.notifyObservers(MENU_CHANGED))
		});

		BehaviorService.addObserver(this, BEHAVIOR_CHANGED, () => {
			super._getMenu()
				.then(menu => BehaviorService.applyTo(menu))
				.then(menu => this.notifyObservers(MENU_CHANGED))
		});

		SelectedCustomerProductAvailabilityService.addObserver(this, AVAILABILITY_CHANGED, () => {
			super._getMenu()
				.then(menu => SelectedCustomerProductAvailabilityService.applyTo(menu))
				.then(menu => this.notifyObservers(MENU_CHANGED))
		});
	}

	/**
	 * @override
	 */
	get cacheKey() {
		return 'selected-customer-menu'
	}

	/**
	 * @override
	 */
	get promotionService() {
		return PromotionsService
	}

	/**
	 * @override
	 */
	_getSelectedMenuId() {
		return BasketService.getSelectedMenuId()
	}

	/**
	 * @override
	 */
	_getMenu() {
		return super._getMenu()
			.then(menu => {
				let menuChanged = menu.id != this.lastMenuId
				if(menuChanged || !this.menuPostProcessingCompleted) {
					
					if(menuChanged) {
						this.lastMenuId = menu.id
						this.menuPostProcessingCompleted = false
						this._postProcessPromise =  null
					}

					return this._postProcessPromise ||
						(
							this._postProcessPromise = Promise.all([BehaviorService.applyTo(menu), SelectedCustomerProductAvailabilityService.applyTo(menu), SelectedCustomerPreferenceService.applyTo(menu)])
								.then(() => {
									this.menuPostProcessingCompleted = true
									this._postProcessPromise = null
									return menu
							})
						)
				}
				else {
					return menu
				}
			})
	}

	/**
	 * @override
	 */
	_getUserBehaviors() {
		return BehaviorService.getBehaviorData()
	}

	/**
	 * @override
	 */
	_dumpCache() {
		this.lastMenuId = null
		super._dumpCache()
	}

}

export default new SelectedCustomerMenuService()

// Re-export base service's constants for convenience 
export { MENU_CHANGED } from './menu-service'