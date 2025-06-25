import '../util/admin-context-guard'
import GenericCrudService from '../util/generic-crud-service'
import OheicsMenu from '../model/oheics-menu'

class OheicsMenuService extends GenericCrudService {

  constructor() {
    super(OheicsMenu, '/system/menus')
  }
}

export default new OheicsMenuService()

// Re-export for convenience
export { ENTITIES_MODIFIED } from '../util/generic-crud-service'