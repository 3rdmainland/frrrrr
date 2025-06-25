import ApiHttp from '../http';
import Store from '../model/store'
import Menu from '../model/menu'
import filterToQuery from '../util/filter-to-query'

class StoreService {

	locate(lat, lng, radius = 10, orderType='', orderTime = 0) {

		var orderChannel = typeof process !== 'undefined' && process.env ? process.env.VUE_APP_ORDERING_CHANNEL : "WEB";
		return ApiHttp.get(`/stores/locate?lat=${lat}&lng=${lng}&radius=${radius}&orderType=${orderType}&orderTime=${orderTime}&orderChannel=${orderChannel}`)
			.then(response => {
				let data = response.data;
				return {
					"totalPages": data.totalPages,
					"totalElements": data.totalElements,
					"pageNumber": data.pageNumber,
					"stores": data.stores.map(s => new Store(s)),
				};
			});
	}

	getStores(pageNumber = 0, pageSize = 50) {
		return ApiHttp.get(`/stores?pageNumber=${pageNumber}&pageSize=${pageSize}`)
			.then(response => {
			  response.data.stores = response.data.stores.map(s => new Store(s))
			  return response.data
			})
	}

	getStore(id, filters) {
		return ApiHttp.get(`/stores/${id}?${filterToQuery(filters)}`)
			.then(response => new Store(response.data.store))
	}
	getStoreByCode(code, filters) {
		return ApiHttp.get(`/stores/by-code/${code}?${filterToQuery(filters)}`)
			.then(response => new Store(response.data.store))
	}

	/**
	 * Returns the store in the context of a particular order type. The stores capacity, menuId etc will be populated
	 * appropriately according to the order type passed in
	 */
	getStoreForOrderType(id, orderType) {
		return this.getStore(id, {orderType})
	}

	getStoreForOrderTypeAndStoreCode(code, orderType) {
		return this.getStoreByCode(code, {orderType})
	}

	/**
	 * Accepts a short-code, and returns the relevant store's id as well as a tableId
	 */
	resolveStoreShortCode(shortCode) {
		return ApiHttp.get(`/stores/resolveTableCode/${shortCode}`)
			.then(response => {
				let {store, tableId} = response.data
				return { store: new Store(store), tableId }
			})
	}
}

export default new StoreService();
