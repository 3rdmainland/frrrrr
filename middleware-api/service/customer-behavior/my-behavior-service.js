import '../../util/web-context-guard'
import BehaviorService, { BEHAVIOR_CHANGED } from './behavior-service'
import MeService from '../customer/me-service'
import AuthService, { AUTH_CHANGED } from '../auth-service';

class MyBehaviorService extends BehaviorService {

	constructor() {
		super()
		this._cache = null

		AuthService.addObserver(this, AUTH_CHANGED, () => {
			this._cache = null
			this.notifyObservers(BEHAVIOR_CHANGED)
		})
	}

	/**
	 * @override
	 */
	get customerId() {
    return MeService.customerId
  }

	/**
	 * @override
	 */
	getBehaviorData() {
		return this._cache || (this._cache = super.getBehaviorData()
				.catch(e => {
				  this._cache = null
				  return Promise.reject(e)
				}))
	}
}

export default new MyBehaviorService()

// Re-export for convenience 
export { BEHAVIOR_CHANGED }