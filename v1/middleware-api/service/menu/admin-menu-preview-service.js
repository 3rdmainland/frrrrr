import '../../util/admin-context-guard'
import MenuService, { MENU_CHANGED } from './menu-service'
import AdminPromotionsPreviewService from '../admin-promotions-preview-service'
import AdminLanguageService, { LANGUAGE_CHANGED } from '../admin-language-service'
import Cache from '../i18n-cache-service'

import { ENTITIES_MODIFIED } from '../../util/generic-crud-service'
import MenuEntityService, { ENTITIES_CHANGED } from '../authoring/menu-entity-service'
import EntityImagesAuthoringService, { ENTITY_IMAGES_CHANGED } from '../authoring/entity-images-authoring-service'
import ImageAuthoringService from '../authoring/image-authoring-service'
import OheicsMenuService from '../oheics-menu-service'

const LOCAL_STORAGE_KEY = 'nandos-admin-menu-preview-id'

class AdminMenuPreviewService extends MenuService {

	constructor() {
		super()
		this._menuId = null
		this._dropAllCaches = this._dropAllCaches.bind(this)

		AdminLanguageService.addObserver(this, LANGUAGE_CHANGED, () => {
			this._configuredProducts = {}
			this.notifyObservers(MENU_CHANGED)
		})

		// Listen to authoring related services and drop menu preview cache if any data changes
		MenuEntityService.addObserver(this, ENTITIES_CHANGED, this._dropAllCaches)
		EntityImagesAuthoringService.addObserver(this, ENTITY_IMAGES_CHANGED, this._dropAllCaches)
		ImageAuthoringService.addObserver(this, ENTITIES_MODIFIED, this._dropAllCaches)
		OheicsMenuService.addObserver(this, ENTITIES_MODIFIED, this._dropAllCaches)
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
		return 'preview-menu'
	}

	/**
	 * @override
	 */
	get promotionService() {
		return AdminPromotionsPreviewService
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
	_getMenuUrl(menuId) {
		return `/v2/system/pack/menu/${menuId}/preview?languageIso=${AdminLanguageService.languageBaseKey}`
	}

	/**
	 * @override
	 */
	_getUserBehaviors() {
		return Promise.resolve([])
	}

	_dropAllCaches() {
		Cache.clearAll(this.cacheKey)
		this.notifyObservers(MENU_CHANGED)
	}
}

export default new AdminMenuPreviewService()

// Re-export base service's constants for convenience 
export { MENU_CHANGED } from './menu-service'