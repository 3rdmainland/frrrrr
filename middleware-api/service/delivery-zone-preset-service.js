import '../util/admin-context-guard'
import GenericCrudService from '../util/generic-crud-service'
import StoreDeliveryZoneConfigSet from '../model/store-delivery-zone-config-set'

class DeliveryZonePresetService extends GenericCrudService {

  constructor() {
    super(StoreDeliveryZoneConfigSet, '/admin/stores/geozones/configurations')
  }
}

export default new DeliveryZonePresetService()