export default class Basket {

    constructor(data) {
        this.id = data.id
        this.totalItems = data.totalItems
        this.totalPrice = data.totalPrice
        this.totalVat = data.totalVat
        this.items = data.items
        this.maximumOrderValue = data.maximumOrderValue
        this.minimumOrderValue = data.minimumOrderValue
        this.customerId = data.customerId
        this.context = data.context // context the basket was created/placed in (ADMIN, WEB, IOS, ANDROID etc)
        this.matchedCampaigns = data.matchedCampaigns
        this.selectedFreeProductCampaignItem = data.selectedFreeProductCampaignItem || null;
    }

    get isEmpty () {
        return this.totalItems == 0
    }

    get exceedsMaximumOrderValue () {
        return this.totalPrice > this.maximumOrderValue
    }

    get underMinimumOrderValue () {
        return this.totalPrice < this.minimumOrderValue
    }
}

export const BASKET_STATUSES = {
    AWAITING: 'AWAITING',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    PROCESSED: 'PROCESSED',
}
