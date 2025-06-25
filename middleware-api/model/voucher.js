export default class Voucher {

  constructor(data = {}) {
    this.code = data.token
    this.reference = data.reference
    this.amount = data.amountProcessed
    this.title = data.title
    this.description = data.description
    this.disclaimer = data.disclaimer
  }
}