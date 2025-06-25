import '../util/admin-context-guard'
import ApiHttp from '../http';
import Order from '../model/customer-past-order'
import filterToQuery from '../util/filter-to-query';

class AdminKerbsideOrderService {

  getOrders(filters = {}) {
    return ApiHttp.get(`/kerbside/list?${filterToQuery(filters)}`)
      .then(response => response.data.orders.map(order => new Order(order)))
  }

  markOrderAsAcknowledged(order) {
    return ApiHttp.put(`/kerbside/basket/${order.id}/acknowledged`)
      .then(response =>  new Order(response.data.order))
  }

  markOrderAsFinalised(order) {
    return ApiHttp.put(`/kerbside/basket/${order.id}/finalised`)
      .then(response =>  new Order(response.data.order))
  }
}

export default new AdminKerbsideOrderService();