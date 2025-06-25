import '../util/admin-context-guard'
import GenericCrudService from '../util/generic-crud-service'
import StoreConfig from '../model/store-config'

class StoreConfigurationPresetService extends GenericCrudService {

  constructor() {
    super(StoreConfig, '/admin/stores/configurations')
  }

  // @Override
  // TODO:: Update MW to implement `/admin/stores/configurations/{id}` so we don't need this override
  findById(id) {
    return this.findAll().then(entities => entities.find(entity => entity.id == id))
  }
}

export default new StoreConfigurationPresetService()