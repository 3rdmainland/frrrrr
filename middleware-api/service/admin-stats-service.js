import '../util/admin-context-guard'
import ApiHttp from '../http'
import filterToQuery from '../util/filter-to-query'
import objToFormData from '../util/obj-to-form-data'
import ListToCsv from '../util/csv'

class AdminStatsService {

  getAverageOheicsStats() {
    return ApiHttp.get(`/system/outgoing_logs/average`)
      .then(response => response.data.averages)
  }

  getMaxOheicsStats() {
    return ApiHttp.get(`/system/outgoing_logs/max`)
      .then(response => response.data.maximums)
  }

  getSystemStats(startDate, endDate) {
    let path = `/system/stats`
    if(startDate && endDate) {
      path = `${path}?start=${startDate.getTime()}&end=${endDate.getTime()}`
    }
    return ApiHttp.get(path)
      .then(response => response.data.stats)
  }

  getStoreSalesReport(filters, startDate, endDate, startTime, endTime) {
    let data = Object.assign({
      placedAfter: startDate && startDate.getTime(),
      placedBefore: endDate && endDate.getTime(),
      startTime: startTime,
      endTime: endTime,
    }, filters)

    return ApiHttp.post(`/admin/orders/report`, objToFormData(data))
      .then(response => response.data.result)
  }

  getOrderFailureReport(filters, startDate, endDate) {
    let dateQuery = startDate && endDate && `placedAfter=${startDate.getTime()}&placedBefore=${endDate.getTime()}`
    let filterQuery = filterToQuery(filters)
    let paramJoin = filterQuery == '' ? '' : '&'

    return ApiHttp.get(`/admin/orders/failure/report?${filterQuery}${paramJoin}${dateQuery}`)
      .then(response => response.data.result)
  }

  getStoreSalesReportByContext(filters) {
    return ApiHttp.post(`/admin/orders/report/by-context`, objToFormData(filters))
      .then(response => response.data.result)
  }

  getStoreSalesReportByGuestCustomers(filters) {
    return ApiHttp.post(`/admin/orders/counts-by-customer-type/report`, objToFormData(filters))
      .then(response => response.data.result)
  }

  getStoreSalesReviewReport(filters) {
    return ApiHttp.post(`/admin/orders/ratings/report`, objToFormData(filters))
      .then(response => response.data.result)
  }
    
  getFoodSalesByCampaign(filters) {
    return ApiHttp.post(`/admin/orders/report/by-campaign`, objToFormData(filters))
      .then(response => response.data.result)
  }

  getCustomerRegistrationsReport(filters) {
    return ApiHttp.post(`/admin/customers/report/activity`, objToFormData(filters))
      .then(response => response.data.result)
  }

  getStoreOrderCountsReport(filters = {}, startDate, endDate) {
    let dateQuery = startDate && endDate && `placedAfter=${startDate.getTime()}&placedBefore=${endDate.getTime()}`
    let filterQuery = filterToQuery(filters)
    let paramJoin = filterQuery == '' ? '' : '&'

    return ApiHttp.get(`/admin/orders/count/report?${filterQuery}${paramJoin}${dateQuery}`)
      .then(response => response.data.result)
  }

  getActivityLogs(filters, pageNumber = 0, pageSize = 50) {
    return ApiHttp.get(`/system/sync/actions?pageNumber=${pageNumber}&pageSize=${pageSize}&${filterToQuery(filters)}`)
      .then(response => response.data)
  }
  
  getAvailabilityLogs(filters) {
    return ApiHttp.get(`/system/report/availability?${filterToQuery(filters)}`)
      .then(response => response.data)
  }
  
  getAvailabilityFrequencies(filters) {
    return ApiHttp.post(`/system/report/availability/by-frequency`, objToFormData(filters))
      .then(response => response.data.result)
  }
  
  getExclusionsByStoreReport(filters){
    return ApiHttp.get(`/system/report/store-exclusions`, filterToQuery(filters,true))
      .then(response => response.data.stores)
  }

  getActivityLogsAsCSV(filters, propertyHeaders, propertyGetters, maxEntries=2000) {
    return this.getActivityLogs(filters, 0, maxEntries)
      .then(response => ListToCsv(response.records, propertyGetters, propertyHeaders))
  }
}

export default new AdminStatsService()