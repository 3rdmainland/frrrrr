import '../util/admin-context-guard'
import ApiHttp from '../http';
import Order from '../model/customer-past-order';
import filterToQuery from "../util/filter-to-query";
import AdminFoodOrderToolsService from './admin-food-order-tools-service';
import type { TFilterObject, ICustomerPastOrder } from '@nandos-types/index';
import type { TFailOverReport } from '@nandos-types/response/system';
import type { TBasketFailoverAcknowledged, TBasketFailoverProcessed } from '@nandos-types/response/customer-basket';

class AdminFailoverOrderService {

  getOrders(filters: TFilterObject = {}) {
    return AdminFoodOrderToolsService.getOrders(
      {status: 'FAILOVER', sort: 'DESC', ...filters }, 
      0, 
      100
    ).then(response => response.orders);
  }

  markOrderAsAcknowledged(order: ICustomerPastOrder) {
    return ApiHttp.put<TBasketFailoverAcknowledged>(`/failover/basket/${order.id}/acknowledged`)
      .then(response =>  new Order(response.data.basket));
  }

  markOrderAsCaptured(order: ICustomerPastOrder) {
    return ApiHttp.put<TBasketFailoverProcessed>(
      `/failover/basket/${order.id}/processed`
    ).then(response =>  new Order(response.data.basket));
  }
  
  getFailoverReportByStatus(filters: TFilterObject = {}){
    return ApiHttp.get<TFailOverReport>(`/system/report/failover/by-status${filterToQuery(filters,true)}`).then(response => response.data);
  }
}

export default new AdminFailoverOrderService();