import '../util/admin-context-guard'
import ApiHttp from '../http';

class AdminGlobalConfigService {

  getConfig() {
    return ApiHttp.get(`/system/global/configuration`)
      .then(response => new AdminGlobalConfig(response.data.configuration))
  }

  updateConfig(config) {
    return ApiHttp.put(`/system/global/configuration`, config)
      .then(response => new AdminGlobalConfig(response.data.configuration))
  }

  setPriorityZeroStatus(priorityZeroEngaged) {
    return ApiHttp.put(`/system/global/priority-zero`, { priorityZeroEngaged })
      .then(response => new AdminGlobalConfig(response.data.configuration))
  }
}

class AdminGlobalConfig {

	constructor(data) {
		this.priorityZeroEngaged = data.priorityZeroEngaged
		this.oheicsTimeOffset = data.oheicsTimeOffset
    this.checkPosTotalMismatch = data.checkPosTotalMismatch
		this.giftcardMinimumItemValue = data.giftcardMinimumItemValue
		this.giftcardMaximumItemValue = data.giftcardMaximumItemValue
		this.giftcardDailyPurchaseLimit = data.giftcardDailyPurchaseLimit
	}

}

export default new AdminGlobalConfigService();