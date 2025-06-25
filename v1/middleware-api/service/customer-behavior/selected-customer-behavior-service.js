import '../../util/admin-context-guard'
import BehaviorService, { BEHAVIOR_CHANGED } from './behavior-service'
import SelectedCustomer, { CUSTOMER_CHANGED } from '../customer/selected-customer-service'

class SelectedCustomerBehaviorService extends BehaviorService {

	constructor() {
		super()
		this._cache = null
		SelectedCustomer.addObserver(this, CUSTOMER_CHANGED, () => {
			this._cache = null
			this.notifyObservers(BEHAVIOR_CHANGED)	
		})
	}

	/**
	 * @override
	 */
	get customerId() {
    return SelectedCustomer.customerId
  }

	/**
	 * @override
	 */
	getBehaviorData() {
		return this._cache || (this._cache = super.getBehaviorData())
	}
}

export default new SelectedCustomerBehaviorService()

// Re-export for convenience 
export { BEHAVIOR_CHANGED }