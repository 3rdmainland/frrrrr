import '../../util/admin-context-guard'
import GenericCrudService from '../../util/generic-crud-service'
import HelpItem from '../../model/authoring/help-item'

class HelpItemAuthoringService extends GenericCrudService {

  constructor() {
    super(HelpItem, '/system/help-items')
  }

  // @Override
  _getResponsePropertyName(basePath) { return 'items' }
}

export default new HelpItemAuthoringService()