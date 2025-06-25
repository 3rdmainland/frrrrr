import '../util/admin-context-guard';
import ApiHttp from '../http';
import Order from '../model/customer-past-order';
import objToFormData from '../util/obj-to-form-data';
import ListToCsv from '../util/csv';
import MAX_JAVA_INT from '../util/max-java-int';
import type { TFilterObject } from '@nandos-types/utils';
import type { ICustomAggregateReportLine } from '@nandos-types/model/customer-aggregate-report-line';
import type { 
    TAdminOrderList, 
    TcustomerAggregateReport, 
    TCustomerBasketHistory, 
    TCustomerBasketLog, 
    TCustomerBasketRefund, 
    TCustomerBasketRefundRequest, 
    TAdminUpdateOrder,
    TAdminForceFailQueuedOrder,
    TAdminRequestDriverCallback,
    TOrderLocationReport,
    TOrderTimeFrequencyReport
} from '@nandos-types/response/customer-basket';
import type { ICustomerPastOrder } from '@nandos-types/index';
import type { IDriverRecallRequest } from 'src/model/driver-recall-request';

class AdminFoodOrderToolsService {

    getOrders(filters: TFilterObject, pageNumber = 0, pageSize = 50) {
        return ApiHttp.post<TAdminOrderList>(
            `/admin/orders/list`, 
            objToFormData(Object.assign({pageNumber, pageSize}, filters))
        ).then(response => {
            const orders = response.data.orders.map(order => new Order(order));
            return {
                ...response.data,
                orders
            };
        });
    }

    getAllOrders(filters: TFilterObject) {
        return this.getOrders(filters, 0, MAX_JAVA_INT)
            .then(response => response.orders);
    }

    getOrder(customerId: string, orderId: string) {
        return ApiHttp.get<TCustomerBasketHistory>(`/customers/${customerId}/basket/history/${orderId}`)
            .then(response => new Order(response.data.basket));
    }

    getOrderLogs(customerId: string, orderId: string) {
        return ApiHttp.get<TCustomerBasketLog>(`/customers/${customerId}/basket/history/${orderId}/errors`)
            .then(response => response.data.logs);
    }

    getOrdersAsCSV(filters: TFilterObject, propertyHeaders: string[], propertyGetters: ((o: Order) => any)[]) {
        return this.getAllOrders(filters)
            .then(orders => ListToCsv(orders, propertyGetters, propertyHeaders));
    }

    getOrderLocations(filters: TFilterObject) {
        return ApiHttp.post<TOrderLocationReport>(
            `/admin/orders/location/report`, 
            objToFormData(filters)
        ).then(response => response.data.result);
    }

    getOrderFrequencies(filters: TFilterObject) {
        return ApiHttp.post<TOrderTimeFrequencyReport>(`/admin/orders/frequency/report`, objToFormData(filters))
            .then(response => response.data.result)
    }

    getCustomerOrdersReport(filters: TFilterObject, pageNumber = 0, pageSize = 50) {
        return ApiHttp.post<TcustomerAggregateReport>(
            `/admin/orders/customers/report`, 
            objToFormData(Object.assign(
                {pageNumber, pageSize}, 
                filters
            ))
        ).then(response => response.data);
    }

    getCustomerOrdersReportAsCSV(filters: TFilterObject, propertyHeaders: string[], propertyGetters: ((report: ICustomAggregateReportLine) => any)[]) {
        return this.getCustomerOrdersReport(
            filters, 
            0, 
            MAX_JAVA_INT
        ).then(report => ListToCsv(
            report.results, 
            propertyGetters, 
            propertyHeaders
        ));
    }

    updateOrder(order: ICustomerPastOrder) {
        return ApiHttp.put<TAdminUpdateOrder>(`/admin/orders`, order)
            .then(response => new Order(response.data.basket));
    }

    refundOrder(order: ICustomerPastOrder, refundComment: string) {
        return ApiHttp.post<TCustomerBasketRefund>(`/admin/orders/refund/${order.id}`, {refundComment})
            .then(response => new Order(response.data.basket));
    }

    requestOrderRefund(order: ICustomerPastOrder) {
        return ApiHttp.post<TCustomerBasketRefundRequest>(`/admin/orders/refund/request/${order.id}`)
            .then(response => new Order(response.data.basket));
    }

    forceFailure(order: ICustomerPastOrder) {
        return ApiHttp.post<TAdminForceFailQueuedOrder>(`/admin/orders/force-failure/${order.id}`)
            .then(response => new Order(response.data.basket));
    }

    requestDriverRecall(order: ICustomerPastOrder, recallFormData: IDriverRecallRequest) {
        return ApiHttp.post<TAdminRequestDriverCallback>(
            `/admin/orders/driver-recall/${order.id}`, 
            recallFormData
        ).then(response =>{
            if(response.data.basket === null){
                throw new Error("Failed to request the driver due to an unkown error. please try again later.");
            }
            return new Order(response.data.basket);
        });
    }
}

export default new AdminFoodOrderToolsService();