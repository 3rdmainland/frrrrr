import '../../util/admin-context-guard'
import filterToQuery from '../../util/filter-to-query'
import ApiHttp from '../../http'
import { BaseExternalEntity } from '../../model/authoring/menu-entity/internal'
import MAX_JAVA_INT from '../../util/max-java-int'


/**
 * This service is responsible for managing all EXTERNAL OHEICS entities related to menu and product authoring.
 * CRUD operations for the following entity types are available through this service:
 * Product, CheckoutInstruction, Store.
 */
class MenuExternalEntityService  {

  getEntities(entityType, filters, pageNumber = 0, pageSize = 30) {
    let type = this.convertEntityTypeToUrlComponent(entityType)
    return ApiHttp.get(`v2/system/menu/external/${type}?pageNumber=${pageNumber}&pageSize=${pageSize}&${filterToQuery(filters)}`)
      .then(response => {
        response.data.page = response.data.page.map(BaseExternalEntity.parseEntity)
        return response.data
      })
  }

  // Returns external entities that have no inbound relations. Ie, an orphaned entity has no mapping to one or more of our internal entities
  // Eg. an external OHEICS product that is never assigned to one of our PRODUCT_DEFINITIONs 'pos' relations
  getOrphanedEntities(entityType, filters, pageNumber = 0, pageSize = MAX_JAVA_INT) {
    let _filters =  Object.assign({advancedSearch: true, orphansOnly: true}, filters)
    return this.getEntities(entityType, _filters, pageNumber, pageSize)
  }

  /**
   * Converts from an entity's `entityType` to the URI component for the related endpoint.
   * Eg: PRODUCT_FEATURE_DEFINITION -> product-feature
   */
  convertEntityTypeToUrlComponent(entityType) {
    return entityType
      .toLowerCase()
      .replace(/_/g, '-')
      .replace('external-', '')
  }

}

export default new MenuExternalEntityService()