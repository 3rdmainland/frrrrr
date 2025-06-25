import {Product} from './authoring/menu-entity/internal'

export default class Audience {

    constructor(data = {}) {
        this.firstPurchaseOnly = !!data.firstPurchaseOnly
        this.registeredCustomersOnly = !!data.registeredCustomersOnly
        this.singleRedemptionOnly = !!data.singleRedemptionOnly
        this.minBasketAmount = data.minBasketAmount
        this.orderTypes = data.orderTypes
        this.contexts = data.contexts
        this.basketProducts = (data.basketProducts || []).map(p => new Product(p))
        this.basketExclusions = (data.basketExclusions || []).map(p => new Product(p))
        this.specificMobilePhoneNumbers = data.specificMobilePhoneNumbers
        this.dailyCampaignRedemptionLimit = data.dailyCampaignRedemptionLimit
        this.redemptionLimitMsg = data.redemptionLimitMsg;
        this.disqualifyingMsg = data.disqualifyingMsg;
        this.futureOrdersOnly = data.futureOrdersOnly;
    }
}