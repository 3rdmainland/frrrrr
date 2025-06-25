import '../util/admin-context-guard'
import ApiHttp from '../http';
import GiftCardOrder from '../model/customer-past-gift-card-order'
import filterToQuery from '../util/filter-to-query'
import ListToCsv from '../util/csv'
import MAX_JAVA_INT from '../util/max-java-int'

class AdminGiftCardOrderToolsService {

  getOrders(filters, pageNumber = 0, pageSize = 50) {
    return ApiHttp.get(`/admin/giftcardbasket/list?pageNumber=${pageNumber}&pageSize=${pageSize}&${filterToQuery(filters)}`)
      .then(response => {
        response.data.orders = response.data.orders.map(order => new GiftCardOrder(order))
        return response.data
      })
  }

  getOrder(customerId, orderId) {
    return ApiHttp.get(`/customers/${customerId}/giftcardbasket/history/${orderId}`)
      .then(response => new GiftCardOrder(response.data.basket));
  }

  getOrderLogs(customerId, orderId) {
    return ApiHttp.get(`/customers/${customerId}/giftcardbasket/history/${orderId}/errors`)
      .then(response => response.data.logs)
  }

  /**
   * Retrieves gift cards orders, but for each basket item in the order, a new order is returned,
   * as well creating a new order for each card item within a basket item.
   * Eg: A single order with 2 basket items, one of which has a quantity of 4 will result in 5 order items being returned
   */
  getUnwrappedOrders(...rest) {
    return this.getOrders(...rest)
      .then(response => {
        // Expand top level basket items into individual orders
        response.orders = response.orders.map(order => {
          if(order.items.length == 1) {
            order.item = Object.assign({}, order.items[0], order.items[0].cards[0])
            delete order.items
            return order
          }
          else {
            return order.items.map((item, itemIdx) => {
              let itemData = Object.assign({}, item, item.cards[0])
              return Object.assign({}, order, {item: itemData, hideDetails: itemIdx > 0, items: undefined})
            })
          }
        })
        .reduce((prev, curr) => prev.concat(curr), []) // flatten results
        .map(order => {
          // Expand cards within each order into individual orders
          let cards = order.item.cards
          if(cards.length == 1)
            return order
          else // create a new order item from each card
            return cards.map((card, cardIdx) => Object.assign({}, {item: Object.assign({}, order.item, card)}, {hideDetails: true}))
        })
        .reduce((prev, curr) => prev.concat(curr), []) // flatten results

        return response
      })
  }

  getOrdersAsCSV(filters, propertyHeaders, propertyGetters) {
    return this.getUnwrappedOrders(Object.assign({includeItems: true}, filters), 0, MAX_JAVA_INT)
      .then(response => ListToCsv(response.orders, propertyGetters, propertyHeaders))
  }

  getSalesReport(filters) {
    return ApiHttp.get(`/admin/giftcardbasket/report?${filterToQuery(filters)}`)
      .then(response => response.data.result)
  }
}

export default new AdminGiftCardOrderToolsService();