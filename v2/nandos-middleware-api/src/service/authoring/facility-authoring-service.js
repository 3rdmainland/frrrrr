import '../../util/admin-context-guard'
import GenericCrudService from '../../util/generic-crud-service'
import StoreFacility from '../../model/authoring/store-facility'

class FacilityAuthoringService extends GenericCrudService {

  constructor() {
    super(StoreFacility, '/system/facilities')
  }

  // @Override
  _getEntityIdentifier(entity) { return entity.type }

  // @Override
  _getSignleEntityResponsePropertyName(basePath) { return 'facility' }

}

export default new FacilityAuthoringService()