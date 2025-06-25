import '../util/admin-context-guard'
import GenericCrudService from '../util/generic-crud-service'
import TimeSet from '../model/time-set'

class TimeSetPresetService extends GenericCrudService {

  constructor() {
    super(TimeSet, '/admin/stores/opening-times')
  }
}

export default new TimeSetPresetService()