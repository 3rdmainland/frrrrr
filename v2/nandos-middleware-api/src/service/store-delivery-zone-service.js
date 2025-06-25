import '../util/admin-context-guard'
import GenericCrudService from '../util/generic-crud-service'
import StoreDeliveryZone from '../model/store-delivery-zone'

class StoreDeliveryZoneService extends GenericCrudService {

  constructor() {
    super(StoreDeliveryZone, storeId => `/admin/stores/${storeId}/geozones`)
  }

  // @Override
  findAll(storeId, filters) { return super.findAll(filters, storeId) }

  // @Override
  findById(storeId, id) { return super.findById(id, storeId) }

  // @Override
  create(storeId, entity) { return super.create(entity, storeId) }
   
  // @Override
  update(storeId, entity) { return super.update(entity, storeId) }
   
  // @Override
  delete(storeId, entity) { return super.delete(entity, storeId) }
   
}

export default new StoreDeliveryZoneService()