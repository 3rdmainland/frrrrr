import '../util/admin-context-guard'
import GenericCrudService from '../util/generic-crud-service'
import Customer from '../model/customer'

class AdminCustomerToolsService extends GenericCrudService {

  constructor() {
    super(Customer, '/customers')
  }

  findByMobile(mobilePhoneNumber) {
  	return this._buildRequest({params: `/find/mobile/${mobilePhoneNumber}`})
  }

  findByOrderNumber(orderNumber) {
  	return this._buildRequest({params: `/find/order/${orderNumber}`})
  }
}

export default new AdminCustomerToolsService()