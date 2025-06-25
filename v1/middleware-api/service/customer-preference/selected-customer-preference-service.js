import '../../util/admin-context-guard'
import PreferenceService, { PREFERENCE_CHANGED } from './preference-service'
import SelectedCustomerService from '../customer/selected-customer-service'

class SelectedCustomerPreferenceService extends PreferenceService {

	constructor() {
		super()
	}

	/**
	 * @override
	 */
	get customerService() {
		return SelectedCustomerService
	}
}

export default new SelectedCustomerPreferenceService()

// Re-export for convenience 
export { PREFERENCE_CHANGED }