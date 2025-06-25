import '../util/admin-context-guard'
import ApiHttp from '../http';
import AggregatorOrder from '../model/aggregator-order'
import filterToQuery from '../util/filter-to-query'
import objToFormData from '../util/obj-to-form-data'
import ListToCsv from '../util/csv'
import MAX_JAVA_INT from '../util/max-java-int'

class AdminAggregatorOrderToolsService {

  getOrders(filters, pageNumber = 0, pageSize = 50) {
    return ApiHttp.post(`/admin/aggregator/list`, objToFormData(Object.assign({pageNumber, pageSize}, filters)))
      .then(response => {
        response.data.orders = response.data.orders.map(order => new AggregatorOrder(order))
        return response.data
      })
  }

  getOrdersAsCSV(filters, propertyHeaders, propertyGetters) {
    return this.getOrders(filters, 0, MAX_JAVA_INT)
      .then(response => ListToCsv(response.orders, propertyGetters, propertyHeaders))
  }

  getOrderLogs(orderId) {
    return ApiHttp.get(`/admin/aggregator/orders/${orderId}/errors`)
      .then(response => response.data.logs)
  }

  getStoreOrderCountsReport(filters = {}, startDate, endDate) {
    let dateQuery = startDate && endDate && `placedAfter=${startDate.getTime()}&placedBefore=${endDate.getTime()}`
    let filterQuery = filterToQuery(filters)
    let paramJoin = filterQuery == '' ? '' : '&'

    return ApiHttp.get(`/admin/aggregator/report/count?${filterQuery}${paramJoin}${dateQuery}`)
      .then(response => response.data.result)
  }
}

export default new AdminAggregatorOrderToolsService();