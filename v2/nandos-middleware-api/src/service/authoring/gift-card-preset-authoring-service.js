import '../../util/admin-context-guard'
import GenericCrudService from '../../util/generic-crud-service'
import GiftCardPreset from '../../model/authoring/gift-card-preset'

class GiftCardPresetAuthoringService extends GenericCrudService {

  constructor() {
    super(GiftCardPreset, '/system/giftcard/presets')
  }
}

export default new GiftCardPresetAuthoringService()