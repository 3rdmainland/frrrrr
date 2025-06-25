import GiftCard from './gift-card'

export const SECURED = 'SECURED'
export const QUEUED = 'QUEUED'
export const ACTIVATED = 'ACTIVATED'
export const FAILED = 'FAILED'

export const STATUSES = [SECURED, QUEUED, ACTIVATED, FAILED]

export default class GiftCardBasketItem {

  constructor(data = {}) {
  	this.id = data.id

  	this.fromName = data.fromName
  	this.price = data.price
    this.message = data.message
  	this.scheduled = data.scheduled
    this.srcImageUrl = data.srcImageUrl // the preset card design the user chose
  	this.renderedImageData = data.renderedImageData // used to save base64 encoded image
  	this.renderedImageUrl = data.renderedImageUrl // used to read the final card image

    /**
     * a `GiftCardBasketItem` can contain multiple gift cards (for multiple recipients)
     * `cards` is list of one or more gift cards, that contain info about each card's intended recipient
     **/
    this.cards = (data.cards && data.cards.map(card => new GiftCard(card))) || []
  }

  get quantity() {
  	return this.cards.length
  }
}