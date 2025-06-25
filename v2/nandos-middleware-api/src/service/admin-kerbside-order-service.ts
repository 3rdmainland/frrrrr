import '../util/admin-context-guard';
import ApiHttp from '../http';
import Order from '../model/customer-past-order';
import filterToQuery from '../util/filter-to-query';
import type { ICustomerPastOrder } from '@nandos-types/index';
import type { 
  TKerbsideStatebasketAcknowledged, 
  TKerbsideStatebasketFinalised, 
  TKerbsideStateList 
} from '@nandos-types/response/kerbside-state';

class AdminKerbsideOrderService {

  getOrders(filters = {}) {
    return ApiHttp.get<TKerbsideStateList>(
      `/kerbside/list?${filterToQuery(filters)}`
    ).then(response => response.data.orders.map(order => new Order(order)));
  }

  markOrderAsAcknowledged(order: ICustomerPastOrder) {
    return ApiHttp.put<TKerbsideStatebasketAcknowledged>(
      `/kerbside/basket/${order.id}/acknowledged`
    ).then(response =>  new Order(response.data.order));
  }

  markOrderAsFinalised(order: ICustomerPastOrder) {
    return ApiHttp.put<TKerbsideStatebasketFinalised>(
      `/kerbside/basket/${order.id}/finalised`
    ).then(response =>  new Order(response.data.order));
  }
}

export default new AdminKerbsideOrderService();