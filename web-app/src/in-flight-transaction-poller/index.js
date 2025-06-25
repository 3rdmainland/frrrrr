import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import { pollPromise } from 'nandos-timing-utils'

const poller = pollPromise(getInFlightTransactions, 30)

function getInFlightTransactions() {
  return CustomerService.getInFlightTransactions()
    .then(transaction => transactionPoller.handle.running == true ? transactionPoller.transaction = transaction : Promise.reject('NO_TRANSACTION'))
    .then(transaction => {
      transaction.completed ? poller.stop() : null
      return transaction
    })
    .catch(e => poller.stop())
}

const transactionPoller = {
  start: poller.start,
  stop: poller.stop,
  handle: poller.handle,
  transaction: null,
  
  fetchNow: () => {
    poller.start() // restart poller
    return getInFlightTransactions()
  },

  acknowledgeTransaction: () => {
    poller.stop()
    return CustomerService.acknowledgeTransaction(transactionPoller.transaction)
  },
}

export default transactionPoller
