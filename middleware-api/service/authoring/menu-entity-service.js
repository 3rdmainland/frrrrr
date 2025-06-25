import Observable from '../../util/observable'
import '../../util/admin-context-guard'
import filterToQuery from '../../util/filter-to-query'
import ApiHttp from '../../http'
import { BaseEntity } from '../../model/authoring/menu-entity/internal'
import MAX_JAVA_INT from '../../util/max-java-int'

export const ENTITIES_CHANGED = 'ENTITIES_CHANGED'


/**
 * This service is responsible for managing all the entities related to menu and product authoring.
 * CRUD operations for the following entity types are available through this service:
 * MenuTemplate, Category, Product, CheckoutInstruction, ProductFeature, Promotion, QuickLink, SearchKeyword,
 * ProductAllergen, ProductNutritionalComponent, ProductExclusion.
 */
class MenuEntityService extends Observable {

  getDefinitions(entityType, filters, pageNumber = 0, pageSize = 30) {
    let type = this.convertEntityTypeToUrlComponent(entityType)
    return ApiHttp.post(`/v2/system/menu/definition/${type}/list`, Object.assign({pageNumber, pageSize}, filters))
      .then(response => {
        response.data.page = response.data.page.map(BaseEntity.parseEntity)
        return response.data
      })
  }

  getAllDefinitions(entityType, filters) {
    return this.getDefinitions(entityType, filters, 0, MAX_JAVA_INT)
  }

  getDefinition(entityType, id) {
    let type = this.convertEntityTypeToUrlComponent(entityType)
    return ApiHttp.get(`/v2/system/menu/definition/${type}/${id}`)
      .then(response => BaseEntity.parseEntity(response.data.entity))
  }

  /**
   * Useful when we want to create a new entity from scratch
   * Returns a blank entity of type entityType, with and id and relationship specifications
   */
  getDefinitionTemplate(entityType) {
    let type = this.convertEntityTypeToUrlComponent(entityType)
    return ApiHttp.get(`/v2/system/menu/definition/${type}/info`)
      .then(response => BaseEntity.parseEntity(response.data.entity))
  }

  createDefinition(definition, requestMethod = 'post') {
    let type = this.convertEntityTypeToUrlComponent(definition.entityType)
    return ApiHttp[requestMethod](`/v2/system/menu/definition/${type}`, definition)
      .then(response => {

        response.data.entity = BaseEntity.parseEntity(response.data.entity)
        response.data.relationErrors && response.data.relationErrors.forEach(error => error.destination = BaseEntity.parseEntity(error.destination))

        return {
          definition: response.data.entity,
          relationErrors: response.data.relationErrors
        }
      })
  }

  updateDefinition(definition) {
    return this.createDefinition(definition, 'put')
      .then(response => {
        this.notifyObservers(ENTITIES_CHANGED)
        return response
      })
  }

  deleteDefinition(definition) {
    let id = definition.id
    let type = this.convertEntityTypeToUrlComponent(definition.entityType)
    return ApiHttp.delete(`/v2/system/menu/definition/${type}/${id}`)
      .then(response => response.data.status == 'success')
  }

  getDefinitionFromRelation(relation) {
    let id = relation.destinationId
    let entityType = this.convertEntityTypeToUrlComponent(relation.destinationType)
    return this.getDefinition(entityType, id)   
  }

  getReferencesToDefinition(definition) {
    let id = definition.id
    let type = this.convertEntityTypeToUrlComponent(definition.entityType)
    
    return ApiHttp.get(`/v2/system/menu/definition/${type}/${id}/references`)
      .then(response => {
        Object.values(response.data.references)
          .forEach(referenceQualifierSet => {
            referenceQualifierSet.forEach(reference => {
              reference.source = reference.source && BaseEntity.parseEntity(reference.source)
              reference.destination = reference.destination && BaseEntity.parseEntity(reference.destination)
            })
          })
        return response.data.references
      })
  }

  /**
   * Specific to MENU_TEMPLATE entities
   */
  publishTemplate(menuTemplateId) {
    return ApiHttp.put(`/v2/system/menu/definition/menu-template/${menuTemplateId}/publish`)
      .then(response => response.data.asyncTask)
  }
  
  /**
   * Specific to MENU_TEMPLATE entities
   */
  getCurrentPublishTask(menuTemplateId) {
    return ApiHttp.get(`/v2/system/menu/definition/menu-template/${menuTemplateId}/publish/current`)
      .then(response => response.data.asyncTask)
  }
  
  /**
   * Specific to CAMPAIGN_DEFINITION entities
   */
  getCampaignBasketDiscountOptions() {
    return ApiHttp.get(`/v2/system/menu/definition/campaign/basket-discount-options`)
      .then(response => response.data.basketDiscountOptions)
  }

  getDiscountCodeStats(definitionId){
    return ApiHttp.get(`/v2/system/menu/definition/campaign/discount-code-stats/${definitionId}`)
        .then(response => response.data.stats)
  }

  /**
   * Converts from an entity's `entityType` to the URI component for the related endpoint.
   * Eg: PRODUCT_FEATURE_DEFINITION -> product-feature
   */
  convertEntityTypeToUrlComponent(entityType) {
    return entityType
      .toLowerCase()
      .replace(/_/g, '-')
      .replace('-definition', '')
  }

}

export default new MenuEntityService()