import Basket from '../model/basket'
import GiftCardBasketItem from '../model/gift-card-basket-item'

export default class GiftCardBasket extends Basket {

  constructor(data) {
    super(data)
    this.items = data.items && data.items.map(i => new GiftCardBasketItem(i)) || []
    this.minimumItemValue = data.minimumItemValue
    this.maximumItemValue = data.maximumItemValue
    this.dailyPurchaseLimit = data.dailyPurchaseLimit
    this.totalPurchasedToday = data.totalPurchasedToday
  }

  get title() {
    return `${this.totalItems} gift card${this.totalItems > 1 ? 's' : ''}`
  }

  get exceedsDailyPurchaseLimit() {
    return this.totalPrice + this.totalPurchasedToday > this.dailyPurchaseLimit
  }

}