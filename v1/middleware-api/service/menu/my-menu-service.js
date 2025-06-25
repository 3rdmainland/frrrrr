import '../../util/web-context-guard'
import MenuService, { MENU_CHANGED } from './menu-service'
import MyBehaviorService, { BEHAVIOR_CHANGED } from '../customer-behavior/my-behavior-service'
import MyPreferenceService, { PREFERENCE_CHANGED } from '../customer-preference/my-preference-service'
import MyBasketService from '../basket/my-basket-service'
import PromotionsService from '../promotions-service'
import MyProductAvailabilityService, { AVAILABILITY_CHANGED } from '../product-availability/my-product-availability-service'
import MyLanguageService, { LANGUAGE_CHANGED } from '../my-language-service'

class MyMenuService extends MenuService {

	constructor() {
		super()
		this.lastMenuId = null

		this.menuPostProcessingCompleted = false // indicates whether product availability and behaviour data has been applied to menu yet
		this._postProcessPromise = null

		MyProductAvailabilityService.menuService = this

		MyPreferenceService.addObserver(this, PREFERENCE_CHANGED, () => {
			super._getMenu()
				.then(menu => MyPreferenceService.applyTo(menu))
				.then(menu => this.notifyObservers(MENU_CHANGED))
		});

		MyBehaviorService.addObserver(this, BEHAVIOR_CHANGED, () => {
			super._getMenu()
				.then(menu => MyBehaviorService.applyTo(menu))
				.then(menu => this.notifyObservers(MENU_CHANGED))
		});

		MyProductAvailabilityService.addObserver(this, AVAILABILITY_CHANGED, () => {
			super._getMenu()
				.then(menu => MyProductAvailabilityService.applyTo(menu))
				.then(menu => this.notifyObservers(MENU_CHANGED))
		});

		MyLanguageService.addObserver(this, LANGUAGE_CHANGED, () => {
			this._configuredProducts = {}
			this.notifyObservers(MENU_CHANGED)
		})
	}

	/**
	 * @override
	 */
	get cacheKey() {
		return 'my-menu'
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
		return MyBasketService.getSelectedMenuId()
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
							this._postProcessPromise = Promise.all([MyBehaviorService.applyTo(menu), MyProductAvailabilityService.applyTo(menu), MyPreferenceService.applyTo(menu)])
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
		return MyBehaviorService.getBehaviorData()
	}

	/**
	 * @override
	 */
	_dumpCache() {
		this.lastMenuId = null
		super._dumpCache()
	}

}

export default new MyMenuService()

// Re-export base service's constants for convenience 
export { MENU_CHANGED } from './menu-service'