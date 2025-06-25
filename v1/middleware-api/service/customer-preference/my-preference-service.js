import '../../util/web-context-guard'
import PreferenceService, { PREFERENCE_CHANGED } from './preference-service'
import MeService from '../customer/me-service'

class MyPreferenceService extends PreferenceService {

	constructor() {
		super()
	}

	/**
	 * @override
	 */
	get customerService() {
		return MeService
	}
}

export default new MyPreferenceService()

// Re-export for convenience 
export { PREFERENCE_CHANGED }