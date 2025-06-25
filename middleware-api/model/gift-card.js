export const ACTIVE = 'ACTIVE'
export const DEACTIVATED = 'DEACTIVATED'
export const EXPIRED = 'EXPIRED'
export const REDEEMED = 'REDEEMED'

export const STATUSES = [ACTIVE, DEACTIVATED, EXPIRED, REDEEMED]

export default class GiftCard {

  constructor(data = {}) {
    this.id = data.id

    this.renderedImageUrl = data.renderedImageUrl // used to read the final card image
    this.toName = data.toName
    this.toMobilePhoneNumber = data.toMobilePhoneNumber
    this.toEmail = data.toEmail
    
    // The following properties are only available after the card has been purchased
    this.issuedAmount = data.issuedAmount
    this.status = data.status
    this.wiBalance = data.wiBalance
    this.wiCode = data.wiCode
    this.wiId = data.wiId
    this.createdDate = data.createdDate
    this.expiryDate = data.expiryDate
  }
}