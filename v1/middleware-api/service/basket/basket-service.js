import Observable from '../../util/observable'
import ApiHttp from '../../http';
import FoodBasket, {ORDER_TYPES} from '../../model/food-basket'
import UserProduct from '../../model/user-product'
import ProductState from '../../model/product-state'
import CheckoutInstruction from '../../model/checkout-instruction'

export const BASKET_CONTENTS_CHANGED = 'BASKET_CONTENTS_CHANGED'
export const ORDER_SETUP_CHANGED = 'ORDER_SETUP_CHANGED'

export const FULFILLMENT_TYPES = {
    ASAP: 'ASAP',
    FUTURE: 'FUTURE',
};

export const BASKET_TIME_SLOT_INTERVAL = 15
export const STORE_MIN_ORDER_HOUR = process.env['VUE_APP_MIN_FUTURE_ORDER_HOUR']
export const STORE_MAX_ORDER_HOUR = process.env['VUE_APP_MAX_FUTURE_ORDER_HOUR']

export default class BasketService extends Observable {

    get BASKET_TIME_SLOT_INTERVAL() {
        return BASKET_TIME_SLOT_INTERVAL;
    }

    get DAILY_BASKET_HOUR_MIN() {
        return parseInt(STORE_MIN_ORDER_HOUR)
    }

    get DAILY_BASKET_HOUR_MAX() {
        return parseInt(STORE_MAX_ORDER_HOUR) - 1 // subtract an hour to allow stores to not have to deal with future orders during wind down times
    }

    constructor() {
        super();
    }

    get customerId() {
        throw new Error('Basket Service:: customerId: This method must be implemented by the parent class')
    }

    _processBasketResponse(response) {
        return new FoodBasket(response.data.basket)
    }

    getBasket() {
        return ApiHttp.get(`/customers/${this.customerId}/basket`)
            .then(response => this._processBasketResponse(response))
    }

    getBasketItem(basketItemId) {
        return this.getBasket()
            .then(basket => basket.items.find(item => item.id === basketItemId));
    }

    getBasketSummary() {
        return ApiHttp.get(`/customers/${this.customerId}/basket/summary`)
            .then(response => this._processBasketResponse(response))
    }

    /**
     * Adds a product to the user's basket, or simply increases the product's quantity if the product
     * already exists in the basket (with the exact same configuration)
     */
    addBasketItem(userProduct) {

        // First attempt to update matching product if it exists in user's basket
        return this.getBasket()
            .then(basket => {
                let matches = basket.items.filter(item => item.productId == userProduct.getId())

                let incomingProductStateIdentifier = userProduct.generateSelectionIdentifier()

                for (var i = 0; i < matches.length; i++) {
                    let matchedBasketItem = matches[i]
                    let basketItemAsState = userProduct.product.configureFromBasketItem(matchedBasketItem, new ProductState())
                    let basketItemStateIdentifier = Object.keys(basketItemAsState.selection).sort().toString()

                    // Exact state match found, simply update the existing basket item's quantity
                    if (basketItemStateIdentifier == incomingProductStateIdentifier) {
                        userProduct.orderQuantity += matchedBasketItem.quantity
                        return this.updateBasketItem(matchedBasketItem.id, userProduct)
                    }
                }

                // No EXACT matching product was found, add a new item to basket
                return ApiHttp.post(`/customers/${this.customerId}/basket/items`, BasketService.basketiseProduct(userProduct))
                    .then(response => this._processBasketResponse(response))
            })
    }

    addBasketItems(userProducts) {
        return ApiHttp.post(`/customers/${this.customerId}/basket/basketItems`, userProducts.map(p => BasketService.basketiseProduct(p)))
            .then(response => this._processBasketResponse(response))
    }

    updateBasketItem(basketItemId, userProduct) {
        let productData = BasketService.basketiseProduct(userProduct);
        productData.basketItemId = basketItemId;
        return ApiHttp.put(`/customers/${this.customerId}/basket/items`, productData)
            .then(response => this._processBasketResponse(response))
    }

    setDriverTip(amount) {
        return ApiHttp.post(`/customers/${this.customerId}/basket/tip`, {amount})
            .then(response => this._processBasketResponse(response))
    }

    removeBasketItem(basketItemId) {
        return ApiHttp.delete(`/customers/${this.customerId}/basket/items/${basketItemId}`)
            .then(response => this._processBasketResponse(response))
    }

    addSelectedFreeProductToBasket(autoComboMatch) {
        let data = {id: autoComboMatch.value};

        return ApiHttp.put(`/customers/${this.customerId}/basket/items/free-product`, data)
            .then(response => this._processBasketResponse(response))
    }

    addAutoComboItem(autoComboMatch) {
        let data = BasketService.basketiseProduct(new UserProduct(autoComboMatch.comboProduct, autoComboMatch.comboProductState));
        data.autoComboItems = autoComboMatch.replacedBasketItems.map(i => i.id);

        return ApiHttp.put(`/customers/${this.customerId}/basket/items/auto-combo`, data)
            .then(response => this._processBasketResponse(response))
    }

    reorder(orderId) {
        return ApiHttp.post(`/customers/${this.customerId}/basket/history/${orderId}/reorder`)
            .then(response => this._processBasketResponse(response))
    }

    updateKerbsideState(basketId, status, coordinates) {
        return ApiHttp.put(`/customers/${this.customerId}/basket/kerbside`, {basketId, status/*, coordinates*/})
            .then(response => response.data)
    }

    configureOrder(data) { // {orderType, storeId, customerAddressId, fulfillmentType, orderTime = 0, collectionSearchAddress, collectionSearchCoordinates, kerbsideCollect, customerVehicle, tableId}
        return ApiHttp.put(`/customers/${this.customerId}/basket`, data)
            .then(response => this._processBasketResponse(response))
    }

    configureEatInOrder(storeId, tableId) {
        return this.configureOrder({orderType: ORDER_TYPES.EAT_IN, storeId, tableId})
    }

    getCheckoutInstructions() {
        return this.getBasketSummary()
            .then(basket => ApiHttp.get(`/v2/pack/checkout-instruction?basketId=${basket.id}`))
            .then(response =>
                response.data.checkoutInstructions
                    .map(i => new CheckoutInstruction(i))
                    .sort((a, b) => b.displayOrder - a.displayOrder)
            )
    }

    setCheckoutInstructions(instructions) {
        return ApiHttp.put(`/customers/${this.customerId}/basket`, {checkoutInstructions: instructions.map(BasketService.basketiseCheckoutInstruction)})
            .then(response => this._processBasketResponse(response))
    }

    getSelectedMenuId() {
        return this.getBasketSummary()
            .then(basket => basket.menuId)
    }

    getStoreName() {
        return this.getBasketSummary()
            .then(basket => basket.storeName);
    }

    get firstAvailableTimeSlot() {
        let date = new Date(Date.now() + BASKET_TIME_SLOT_INTERVAL * 60 * 1000)
        date.setSeconds(0)
        date.setMilliseconds(0)

        //if the time of the first available time slot is after the standard trading hours of any store - set the date to the (Default) trading hours of the store.
        let store_opening_time = new Date()
        store_opening_time.setHours(STORE_MIN_ORDER_HOUR);
        store_opening_time.setMinutes(0);
        store_opening_time.setSeconds(0);
        store_opening_time.setMilliseconds(0);
        if (date.getTime() < store_opening_time.getTime()) {
            date = store_opening_time
        }

        // If the current time's minute value is later than the last available time slot this hour, move to the start of the next hour
        let lastSlotInHour = 60 - BASKET_TIME_SLOT_INTERVAL
        if (date.getMinutes() >= lastSlotInHour) {
            date.setMinutes(0)
            date.setHours(date.getHours() + 1)
        }


        // Round minutes to nearest slot
        let minute = Math.ceil(date.getMinutes() / BASKET_TIME_SLOT_INTERVAL) * BASKET_TIME_SLOT_INTERVAL
        date.setMinutes(minute)


        return date
    }

    get lastAvailableTimeSlot() {
        let date = new Date(this.firstAvailableTimeSlot.getTime() + 60 * 60 * 24 * 1000);

        //if the time of the first available time slot is after the standard trading hours of any store - set the date to the (Default) trading hours of the store.
        let store_opening_time = new Date(date.getTime())
        store_opening_time.setHours(STORE_MAX_ORDER_HOUR);
        store_opening_time.setMinutes(0);
        store_opening_time.setSeconds(0);
        store_opening_time.setMilliseconds(0);

        if (date.getTime() > store_opening_time.getTime()) {
            date = store_opening_time
        }

        return date
    }

    static basketiseProduct(userProduct, isRoot = true) {
        let result = {productId: userProduct.getId()};

        if (isRoot) {
            result.quantity = userProduct.orderQuantity;
            result.computedDescription = userProduct.getConfigurationDescription();
        }

        if (userProduct.hasRelatedProducts()) {
            result.children = userProduct.getRelatedProducts(true)
                .filter(child => child.isSelected())
                .map(child => BasketService.basketiseProduct(child, false))
        }
        return result;
    }

    static basketiseCheckoutInstruction(checkoutInstruction) {
        let result = {productId: checkoutInstruction.id, productName: checkoutInstruction.name};
        return result;
    }
}