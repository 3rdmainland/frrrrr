import Observable from '../../util/observable'
import ApiHttp from '../../http';

import Menu from '../../model/menu'
import MenuCategory, { CATEGORY_DISPLAY_TYPES } from '../../model/menu-category'
import UserProduct from '../../model/user-product'
import MenuDisplayItem from '../../model/menu-display-item'
import ProductState from '../../model/product-state'
import Cache from '../i18n-cache-service'

import AutoComboService from '../auto-combo-service'
import UpsellService from '../upsell-service'
import KeywordService from '../keyword-service'
import KeywordAutoconfigurator from '../keyword-autoconfig-service'
import BehaviorAutoconfigurator from '../behavior-autoconfig-service'

export const MENU_CHANGED = 'MENU_CHANGED'

export default class MenuService extends Observable {

	constructor() {
		super()
		this._tempMenuPromise = null; // Guards against multiple requests to getMenu triggering multiple menu's being built (We need this in addition to the GET in-flight requests guards in the http-api layer)
		this._configuredProducts = {};
	}

	browse(path) {
		return this._getMenu()
			.then(menu => new MenuDisplayItem(menu.browse(path)))
	}

	search(query) {
		return KeywordService.resolveKeywords(query)
			.then(keywords => {
				return this._getMenu()
					.then(menu => this._search(menu, keywords));
			})
	}

	getRandomProduct(...rest) {
		return this.getRandomProducts(1, ...rest)
			.then(products => products[0])
	}

	getRandomProducts(count, productPredicate, configurePredicate) {
		return this._getMenu()
			.then(menu => {

				return menu.getRandomProducts(count, productPredicate)
					.map(product => {

						let state = new ProductState()

						if(configurePredicate != false) {

							const configurePredicateIsFn = typeof configurePredicate === 'function'

							const getSelectionCandidates = (parent) => {

								let children = parent.getRelatedProducts()
								if(configurePredicateIsFn) children = children.filter(child => configurePredicate(child))

								if(children == null || children.length == 0)
									return []
								let requiredChildren = children.filter(rp => rp.requiresSelection())
								if(requiredChildren.length)
									return requiredChildren
								else
									return [children[Math.floor(children.length * Math.random())]]
							}

							const selectProduct = (candidates) => {
								candidates.forEach(candidate => {
									candidate.isLeaf()
										? candidate.select(state)
										: selectProduct(getSelectionCandidates(candidate))
								})
							}

							selectProduct(getSelectionCandidates(product))
						}

						return new UserProduct(product, state)
				})

			})
	}

	getRecommendedProducts(limit = 5) {
		return Promise.all([this._getMenu(), this._getUserBehaviors()])
			.then(([menu, behaviours]) => {
				return behaviours
					.sort((a, b) => b.score - a.score)
					.map(b => menu.productMapByDefinitionId[b.productDefinitionId]) // convert to product
					.filter(p => p != null && p.isAvailable()) // filter out products not available in this menu and products that are unavailable
					.slice(0, limit)
					.map(product => {
						let userProduct = new UserProduct(product, new ProductState());
						BehaviorAutoconfigurator.autoconfigure(userProduct.product, userProduct.state);
						return new MenuDisplayItem(userProduct, userProduct.getConfigurationDescription() != '')
					})
			})
	}

	getQuickLinks() {
		return this._getMenu()
			.then(menu => menu.quickLinks.map(ql => new MenuDisplayItem(ql)).filter(i => !i.isEmpty))
	}

	getProductMap() {
		return this._getMenu()
			.then(menu => menu.productMap)
	}

	getNutritionalComponents() {
		return this._getMenu()
			.then(menu => Object.values(menu.productNutritionalComponentsMap).sort((a,b) => (a.displayOrder || 0) - (b.displayOrder || 0)))
	}

	registerUserProduct(userProduct) {
		userProduct.orderQuantity = 1 // reset order quantity when a product is registered/re-registered
		this._configuredProducts[userProduct.product.id] = userProduct;
	}

	retrieveUserProduct(productId, bypassCache = false) {
		return this._getMenu()
			.then(menu => {

				if (bypassCache == false && productId in this._configuredProducts) {
					return this._configuredProducts[productId];
				}

				let result = menu.productMap[productId];

				if (result) {
					result = new UserProduct(result, new ProductState());
					if(bypassCache == false) this.registerUserProduct(result);
				}
				return result;
			})
	}

	/**
	 * The frontend uses product Definition Id's for the URLs (so URLs work across menus)
	 * So it needs a way to retrieve UserProducts using the definition ID
	 */
	retrieveUserProductFromDefinitionId(productDefinitionId, ...rest) {
		return this._getMenu()
			.then(menu => {
				let product = menu.productMapByDefinitionId[productDefinitionId]
				return product && this.retrieveUserProduct(product.id, ...rest)
			})
	}

	// TODO:: remove @v16
	getProductDefinitionIdFromOheicsId(oheicsId) {
		return ApiHttp.get(`/v2/pack/product/resolve/${oheicsId}`)
			.then(response => response.data.productDefinitionId)		
	}

	getCurrentMenuId() {
		return Cache.get(this.cacheKey) && Cache.get(this.cacheKey).id
	}

	getAutoComboMatches(basket) {
		return this._getMenu()
			.then(menu => AutoComboService.autocombo(basket, menu))		
	}

	getUpsells(basket) {
		return this._getMenu()
			.then(menu => UpsellService.getUpsells(basket, menu))		
	}

	getProductUpsells(userProduct, basket) {
		return this._getMenu()
			.then(menu => UpsellService.getUpsellsForProduct(userProduct, basket, menu))		
	}


	get cacheKey() {
		throw new Error('This must be implemented by the parent class. Each menu service must provide its own unique cache key')
	}

	get promotionService() {
		throw new Error('This must be implemented by the parent class. Each menu service must provide the appropriate promotions service instance to use')
	}
	
	_getUserBehaviors() {
		return Promise.reject('This method must be implemented by the parent class')
	}

	_getSelectedMenuId() {
		return Promise.reject('This method must be implemented by the parent class')
	}

	_getSelectedStoreId() {
		return Promise.reject('This method must be implemented by the parent class')
	}

	_getMenuUrl(menuId) {
		return `/v2/pack/menu/${menuId || 'default'}`
	}

	_getMenu() {
		if(this._tempMenuPromise) return this._tempMenuPromise;

		this._tempMenuPromise = this._getSelectedMenuId()
			.then(selectedMenuId => {
				let cachedMenu = Cache.get(this.cacheKey)
				let selectedMenuMatchesCache = cachedMenu && cachedMenu.id == selectedMenuId;
				let canUseDefaultMenu = selectedMenuId == null && cachedMenu && cachedMenu.baseMenu;

				// Check to see if we can return the menu we have in cache
				if(selectedMenuMatchesCache || canUseDefaultMenu) {
					this._tempMenuPromise = null;
					return cachedMenu
				}
				// Else, fetch remote data for new menu
				else {
					this._dumpCache();
					return Promise.all([this._getRawMenuPayload(), this.promotionService.getPromotions()])
						.then(([menuPayload, promotions]) => new Menu(menuPayload, promotions))
						.then(menu => {
							this._tempMenuPromise = null;
							Cache.put(this.cacheKey, menu)
							return menu;
						})
						.catch(e => this.onMenuError(e))				
				}
			})
			.catch(e => this.onMenuError(e))

		return this._tempMenuPromise;
	}

	_getRawMenuPayload() {
		return this._getSelectedMenuId()
			.then(selectedMenuId => ApiHttp.get( this._getMenuUrl(selectedMenuId) ))
			.then(response => response.data.menu)
	}

	onMenuError(e) {
		this._tempMenuPromise = null
		this._dumpCache()
		throw e
	}

	_search(menu, keywords) {
		let results = menu
			.search(keywords, 30)
			.filter(result => !result.product.isHiddenByExclusion()) // Filter out products hidden by the "hidden" execution rule

		results.forEach(r => {
			let state = new ProductState();
			let autoconf = KeywordAutoconfigurator.autoconfigure(r.product, keywords, state);
			r.autoconfig = autoconf.hits > 0;
			if (r.autoconfig) {
				r.score *= (autoconf.hits * 0.5) + 1;
			}
			r.score *= (r.product.userRelevance * 0.1) + 1;
			if (r.product.searchBias) {
				r.score *= r.product.searchBias;
			}
			r.product = new UserProduct(r.product, state);
		});

		results.sort((a, b) => b.score - a.score);

		return results.map(r => new MenuDisplayItem(r.product, r.autoconfig));
	}

	_dumpCache() {
		Cache.clear(this.cacheKey)
		this._configuredProducts = {};
	}
}
