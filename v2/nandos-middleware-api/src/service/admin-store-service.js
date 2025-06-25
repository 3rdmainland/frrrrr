import '../util/admin-context-guard'
import GenericCrudService from '../util/generic-crud-service'
import AdminStore from '../model/admin-store'
import StoreDeliveryZone from '../model/store-delivery-zone'
import filterToQuery from '../util/filter-to-query'
import objToFormData from '../util/obj-to-form-data'
import Store from "../model/store";

class AdminStoreService extends GenericCrudService {

  constructor() {
    super(AdminStore, '/admin/stores')
  }

  /**
   * @Override
   * 
   * Because this endpoint accepts storeIds param, which can be very long (possibly hundreds of UUIDs) we can't use
   * a GET request as that might exceed the maximum allowed URL length, so instead we make a POST request and send the
   * filters in the request's body as FormData
   */
  findAll(filters) {
    return this._buildRequest({
      method:'post',
      data: objToFormData(filters),
      responseParser: this._parseMultipleEntityResponse
    })
    .then(stores => stores.sort((a,b) => a.name.localeCompare(b.name)))
  }

  setStatus(storeId, orderTypeId, forceOffline, offlineReason) {
    let params = orderTypeId == null ? `/${storeId}/override` : `/${storeId}/override/${orderTypeId}`
    let data = {forceOffline, offlineReason}
    return this._buildRequest({method:'put', params, data})
      .then(this._notifyModified)
  }

  getUptimes(storeId, dateRange) {
    return this._buildRequest({
      params: `/${storeId}/uptimes?${filterToQuery(dateRange)}`,
      responseParser: r => r.data.uptimes
    })
  }

  // Retrieves every delivery zones for every store in the system
  getDeliveryZones() {
    return this._buildRequest({params: '/geozones', responseParser: r => r.data.geozones.map(z => new StoreDeliveryZone(z))})
  }

  getStoreGroupingPresets() {
    return this._buildRequest({
      params: '/presets',
      responseParser: r => r.data.presets
    })
  }

  ping(storeId) {
    return this._buildRequest({
      method: 'post',
      params: `/${storeId}/ping`,
      responseParser: this._parseSingleEntityResponse
    });
  }
}

export default new AdminStoreService();