import '../../util/admin-context-guard'
import MenuService, { MENU_CHANGED } from './menu-service'
import PromotionsService from '../promotions-service'
import AdminLanguageService, { LANGUAGE_CHANGED } from '../admin-language-service'
import Cache from '../i18n-cache-service'
import ListToCsv from '../../util/csv'

class AdminUserMenuService extends MenuService {

	constructor() {
		super()

		this._menuId = null

		AdminLanguageService.addObserver(this, LANGUAGE_CHANGED, () => {
			this._configuredProducts = {}
			this.notifyObservers(MENU_CHANGED)
		})
	}

	get menuId() {
		return this._menuId
	}

	set menuId(val) {
		this._menuId = val
	}

	/**
	 * @override
	 */
	get cacheKey() {
		return 'admin-user-menu'
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
		return Promise.resolve(this.menuId)
	}

	/**
	 * @override
	 */
	_getUserBehaviors() {
		return Promise.resolve([])
	}

	getProductsAsCsv(headers, propertyGetters) {
		return this._getMenu()
			.then(menu => ListToCsv(menu.products, propertyGetters, headers))
	}
}

export default new AdminUserMenuService()

// Re-export base service's constants for convenience 
export { MENU_CHANGED } from './menu-service'