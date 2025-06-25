import '../util/admin-context-guard'
import GenericCrudService from '../util/generic-crud-service'
import TaxConfiguration from '../model/tax-configuration'

class TaxConfigurationService extends GenericCrudService {

  constructor() {
    super(TaxConfiguration, '/system/tax-configurations')
  }

  // @Override
  _getResponsePropertyName(basePath) { return 'configurations' }
}

export default new TaxConfigurationService()