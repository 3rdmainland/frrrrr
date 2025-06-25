import '../util/admin-context-guard'
import GenericCrudService from '../util/generic-crud-service'
import Customer from '../model/customer'
import { type ICustomer } from '@nandos-types/index';

class AdminCustomerToolsService extends GenericCrudService<Customer> {

  constructor() {
    super(Customer, '/customers');
  }

  findByMobile(mobilePhoneNumber: string): Promise<ICustomer> {
  	return this._buildRequest({params: `/find/mobile/${mobilePhoneNumber}`});
  }

  findByOrderNumber(orderNumber: string): Promise<ICustomer> {
  	return this._buildRequest({params: `/find/order/${orderNumber}`});
  }
}

export default new AdminCustomerToolsService()