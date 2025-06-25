import '../util/admin-context-guard';
import ApiHttp from '../http';
import type { IAdminGlobalConfig } from '@nandos-types/model/admin-global-config';
import type { TGlobalConfiguration } from '@nandos-types/response/system';

class AdminGlobalConfigService {

  getConfig() {
    return ApiHttp.get<TGlobalConfiguration>(
      `/system/global/configuration`
    ).then(response => new AdminGlobalConfig(response.data.configuration));
  }

  updateConfig(config: IAdminGlobalConfig) {
    return ApiHttp.put<TGlobalConfiguration>(
      `/system/global/configuration`, 
      config
    ).then(response => new AdminGlobalConfig(response.data.configuration));
  }

  setPriorityZeroStatus(priorityZeroEngaged: boolean) {
    return ApiHttp.put<TGlobalConfiguration>(
      `/system/global/priority-zero`, 
      { priorityZeroEngaged }
    ).then(response => new AdminGlobalConfig(response.data.configuration));
  }
}

class AdminGlobalConfig {

  public priorityZeroEngaged: boolean;
  public oheicsTimeOffset: number;
  public checkPosTotalMismatch: boolean;
  public giftcardMinimumItemValue: number;
  public giftcardMaximumItemValue: number;
  public giftcardDailyPurchaseLimit: number;

	constructor(data: IAdminGlobalConfig) {
		this.priorityZeroEngaged = data.priorityZeroEngaged
		this.oheicsTimeOffset = data.oheicsTimeOffset
    this.checkPosTotalMismatch = data.checkPosTotalMismatch
		this.giftcardMinimumItemValue = data.giftcardMinimumItemValue
		this.giftcardMaximumItemValue = data.giftcardMaximumItemValue
		this.giftcardDailyPurchaseLimit = data.giftcardDailyPurchaseLimit
	}

}

export default new AdminGlobalConfigService();