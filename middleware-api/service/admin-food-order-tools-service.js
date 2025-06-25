import '../util/admin-context-guard'
import ApiHttp from '../http';
import Order from '../model/customer-past-order'
import filterToQuery from '../util/filter-to-query'
import objToFormData from '../util/obj-to-form-data'
import ListToCsv from '../util/csv'
import MAX_JAVA_INT from '../util/max-java-int'


class AdminFoodOrderToolsService {

    getOrders(filters, pageNumber = 0, pageSize = 50) {
        return ApiHttp.post(`/admin/orders/list`, objToFormData(Object.assign({pageNumber, pageSize}, filters)))
            .then(response => {
                response.data.orders = response.data.orders.map(order => new Order(order))
                return response.data
            })
    }

    getAllOrders(filters) {
        return this.getOrders(filters, 0, MAX_JAVA_INT)
            .then(response => response.orders)
    }

    getOrder(customerId, orderId) {
        return ApiHttp.get(`/customers/${customerId}/basket/history/${orderId}`)
            .then(response => new Order(response.data.basket));
    }

    getOrderLogs(customerId, orderId) {
        return ApiHttp.get(`/customers/${customerId}/basket/history/${orderId}/errors`)
            .then(response => response.data.logs)
    }

    getOrdersAsCSV(filters, propertyHeaders, propertyGetters) {
        return this.getAllOrders(filters)
            .then(orders => ListToCsv(orders, propertyGetters, propertyHeaders))
    }

    getOrderLocations(filters) {
        return ApiHttp.post(`/admin/orders/location/report`, objToFormData(filters))
            .then(response => response.data.result)
    }

    getOrderFrequencies(filters) {
        return ApiHttp.post(`/admin/orders/frequency/report`, objToFormData(filters))
            .then(response => response.data.result)
    }

    getCustomerOrdersReport(filters, pageNumber = 0, pageSize = 50) {
        return ApiHttp.post(`/admin/orders/customers/report`, objToFormData(Object.assign({
            pageNumber,
            pageSize
        }, filters)))
            .then(response => response.data)
    }

    getCustomerOrdersReportAsCSV(filters, propertyHeaders, propertyGetters) {
        return this.getCustomerOrdersReport(filters, 0, MAX_JAVA_INT)
            .then(report => ListToCsv(report.results, propertyGetters, propertyHeaders))
    }

    updateOrder(order) {
        return ApiHttp.put(`/admin/orders`, order)
            .then(response => new Order(response.data.basket))
    }

    refundOrder(order, refundComment) {
        return ApiHttp.post(`/admin/orders/refund/${order.id}`, {refundComment})
            .then(response => new Order(response.data.basket))
    }

    requestOrderRefund(order) {
        return ApiHttp.post(`/admin/orders/refund/request/${order.id}`)
            .then(response => new Order(response.data.basket))
    }

    forceFailure(order) {
        return ApiHttp.post(`/admin/orders/force-failure/${order.id}`)
            .then(response => new Order(response.data.basket))
    }

    requestDriverRecall(order, recallFormData) {
        return ApiHttp.post(`/admin/orders/driver-recall/${order.id}`,recallFormData)
            .then(response =>{
                if(response.data.basket === null){
                    throw new Error("Failed to request the driver due to an unkown error. please try again later.")
                }
                return new Order(response.data.basket)
            })
    }
}

export default new AdminFoodOrderToolsService();