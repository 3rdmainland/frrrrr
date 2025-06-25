import '../util/admin-context-guard';
import ApiHttp from '../http';
import AggregatorOrder from '../model/aggregator-order';
import filterToQuery from '../util/filter-to-query';
import objToFormData from '../util/obj-to-form-data';
import ListToCsv from '../util/csv';
import MAX_JAVA_INT from '../util/max-java-int';
import { type TFilterObject } from '@nandos-types/utils';
import type { 
  TAggregatorOrderLogs,
  TAggregatorReports, 
  TPagedAggregatorOrder,
} from '@nandos-types/response/aggregator-order';

class AdminAggregatorOrderToolsService {

  getOrders(
    filters: TFilterObject, 
    pageNumber = 0, 
    pageSize = 50
  ) {
    const payload = {
      pageNumber,
      pageSize,
      ...filters
    };

    return ApiHttp.post<TPagedAggregatorOrder>(
      `/admin/aggregator/list`, 
      objToFormData(payload)
    ).then((response) => {
      const orders = response.data.orders.map(order => new AggregatorOrder(order));
      return {
        ...response.data,
        orders
      };
    });
  }

  getOrdersAsCSV(filters: TFilterObject, propertyHeaders: string[], propertyGetters: ((item: AggregatorOrder) => any)[]) {
    return this.getOrders(filters, 0, MAX_JAVA_INT)
      .then(response => ListToCsv(response.orders, propertyGetters, propertyHeaders));
  }

  getOrderLogs(orderId: string) {
    return ApiHttp.get<TAggregatorOrderLogs>(`/admin/aggregator/orders/${orderId}/errors`)
      .then(response => response.data.logs);
  }

  getStoreOrderCountsReport(filters: TFilterObject = {}, startDate: Date, endDate: Date) {
    const dateQuery = startDate && endDate && `placedAfter=${startDate.getTime()}&placedBefore=${endDate.getTime()}`;
    const filterQuery = filterToQuery(filters);
    const paramJoin = (filterQuery == '') ? '' : '&';

    return ApiHttp.get<TAggregatorReports>(`/admin/aggregator/report/count?${filterQuery}${paramJoin}${dateQuery}`)
      .then(response => response.data.result);
  }
}

export default new AdminAggregatorOrderToolsService();