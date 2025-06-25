import '../util/admin-context-guard'
import AdminFoodOrderToolsService from './admin-food-order-tools-service'
import ApiHttp from '../http';
import Order from '../model/customer-past-order'
import filterToQuery from "../util/filter-to-query";

class AdminFailoverOrderService {

  getOrders(filters = {}) {
    return AdminFoodOrderToolsService.getOrders({status: 'FAILOVER', sort: 'DESC', ...filters }, 0, 100)
      .then(response => response.orders)
  }

  markOrderAsAcknowledged(order) {
    return ApiHttp.put(`/failover/basket/${order.id}/acknowledged`)
      .then(response =>  new Order(response.data.basket))
  }

  markOrderAsCaptured(order) {
    return ApiHttp.put(`/failover/basket/${order.id}/processed`)
      .then(response =>  new Order(response.data.basket))
  }
  
  getFailoverReportByStatus(filters = {}){
    return ApiHttp.get(`/system/report/failover/by-status${filterToQuery(filters,true)}`).then(response => response.data)
  }
}

export default new AdminFailoverOrderService();