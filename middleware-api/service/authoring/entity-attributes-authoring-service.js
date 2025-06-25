import '../../util/admin-context-guard'
import GenericCrudService from '../../util/generic-crud-service'
import EntityAttribute from '../../model/authoring/entity-attribute'

class EntityAttributesAuthoringService extends GenericCrudService {

  constructor() {
    super(EntityAttribute, entityId => `/system/entity/${entityId}/attributes`)
  }

  // @Override
  _getEntityIdentifier(entity) { return entity.key }

  // @Override
  findAll(entityId, filters) { return super.findAll(filters, entityId) }

  // @Override
  findById(entityId, id) { return super.findById(id, entityId) }

  // @Override
  create(entityId, entity) { return super.create(entity, entityId) }
   
  // @Override
  update(entityId, entity) { return super.update(entity, entityId) }
   
  // @Override
  delete(entityId, entity) { return super.delete(entity, entityId) }     

}

export default new EntityAttributesAuthoringService()