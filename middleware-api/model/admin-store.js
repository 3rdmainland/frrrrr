import '../util/admin-context-guard'
import {mapI18nValues} from '../service/admin-language-service'
import StoreConfig from './store-config'
import StoreFacility from './authoring/store-facility'
import TimeSet from './time-set'
import AdminStoreOrderType, {ORDER_TYPE_STATUS} from './admin-store-order-type'
import {ORDER_TYPES} from './food-basket'

export const STORE_STATUS = {
    ...ORDER_TYPE_STATUS,
    NOT_LIVE: 'NOT_LIVE',
    DISABLED: 'DISABLED',
    PARTIALLY_DISABLED: 'PARTIALLY_DISABLED',
    HEALTHY: 'HEALTHY',
    PARTIALLY_UNHEALTHY: 'PARTIALLY_UNHEALTHY',
    UNHEALTHY: 'UNHEALTHY',
}

export const POS_TYPE = {
    RES: 'RES',
    SIM: 'SIM',
    STSGEN2: 'STSGEN2'
}

export const OWNERSHIP_TYPE = {
    FRANCHISE: 'FRANCHISE',
    CORPORATE: 'CORPORATE',
}

export default class AdminStore {

    constructor(data) {
        this.id = data.id
        this.posType = POS_TYPE[data.posType]
        this.ownershipType = OWNERSHIP_TYPE[data.ownershipType]
        this.code = data.code
        this.name = data.name
        this.displayName = mapI18nValues(data.displayName)
        this.address = mapI18nValues(data.address)
        this.kerbsideInstructions = mapI18nValues(data.kerbsideInstructions)
        this.phone = data.phone
        this.openingTimes = data.openingTimes && new TimeSet(data.openingTimes) // opening times of physical parent store
        this.configuration = data.configuration && new StoreConfig(data.configuration)
        this.storeOrderTypes = data.storeOrderTypes && data.storeOrderTypes.map(ot => new AdminStoreOrderType(ot)).sort((a, b) => a.type.localeCompare(b.type))

        this.facilities = (data.facilities && data.facilities.map(f => new StoreFacility(f))) || []

        this.collectionCheckoutInstructions = data.collectionCheckoutInstructions
        this.collectionSMSInstructions = data.collectionSMSInstructions
        this.live = !!data.live
        this.visible = !!data.visible
        this.forceOffline = !!data.forceOffline
        this.forceKerbsideOffline = !!data.forceKerbsideOffline

        this.latitude = data.latitude
        this.longitude = data.longitude
        this.failoverEnabled = data.failoverEnabled
        this.kerbsideEnabled = data.kerbsideEnabled
        this.aggregatorAmountVerificationRule = data.aggregatorAmountVerificationRule

        this.merchantCredentialsSlot1 = data.merchantCredentialsSlot1
        this.merchantCredentialsSlot2 = data.merchantCredentialsSlot2
        this.merchantCredentialsSlot3 = data.merchantCredentialsSlot3
        this.walletMerchantCredentialsSlot1 = data.walletMerchantCredentialsSlot1
        this.walletMerchantCredentialsSlot2 = data.walletMerchantCredentialsSlot2
        this.cowabungaVersion = data.cowabungaVersion
        this.cowabungaStoreId = data.cowabungaStoreId
        this.cowabungaHubId = data.cowabungaHubId
        this.cowabungaPassword = data.cowabungaPassword

        this.timeZoneOffset = data.timeZoneOffset; // an integer that represents offset from GMT. Eg: ZA would be 2
        this.timezoneDiff = ((new Date().getTimezoneOffset() / 60) + this.timeZoneOffset) * 60 * 60 * 1000 // computes the millisecond difference between user and store timezone
    }

    get status() {

        if (this.storeOrderTypes.length == 0 || this.storeOrderTypes.some(orderType => orderType.status == STORE_STATUS.MISCONFIGURED))
            return STORE_STATUS.MISCONFIGURED

        else if (!this.live)
            return STORE_STATUS.NOT_LIVE

        else if (this.disabled)
            return STORE_STATUS.DISABLED

        else if (this.storeOrderTypes.every(orderType => !orderType.online && !orderType.disabled))
            return STORE_STATUS.UNHEALTHY

        else if (this.storeOrderTypes.some(orderType => orderType.disabled))
            return STORE_STATUS.PARTIALLY_DISABLED

        else if (this.storeOrderTypes.some(orderType => !orderType.online && !orderType.disabled))
            return STORE_STATUS.PARTIALLY_UNHEALTHY

        else
            return STORE_STATUS.HEALTHY
    }

    get disabled() {
        return this.forceOffline
    }

    get customerDeliveryCapable() {
        return this.storeOrderTypes.some(orderType => orderType.type == ORDER_TYPES.DELIVERY && orderType.customerCapable)
    }

    get customerCollectionCapable() {
        return this.storeOrderTypes.some(orderType => orderType.type == ORDER_TYPES.COLLECTION && orderType.customerCapable)
    }

    get customerEatInCapable() {
        return this.storeOrderTypes.some(orderType => orderType.type == ORDER_TYPES.EAT_IN && orderType.customerCapable)
    }

    get customerAggregatorCapable() {
        return this.storeOrderTypes.some(orderType => orderType.type == ORDER_TYPES.AGGREGATOR && orderType.customerCapable)
    }

    get callCenterDeliveryCapable() {
        return this.storeOrderTypes.some(orderType => orderType.type == ORDER_TYPES.DELIVERY && orderType.callcentreCapable)
    }

    get callCenterCollectionCapable() {
        return this.storeOrderTypes.some(orderType => orderType.type == ORDER_TYPES.COLLECTION && orderType.callcentreCapable)
    }

    get statusIcon() {
        return AdminStore.getStatusIcon(this.status)
    }

    get statusColor() {
        return AdminStore.getStatusColor(this.status)
    }

    static getStatusIcon(status) {
        switch (status) {

            case STORE_STATUS.PARTIALLY_DISABLED:
            case STORE_STATUS.PARTIALLY_UNHEALTHY:
                return 'tonality'

            case STORE_STATUS.NOT_LIVE:
                return 'radio_button_unchecked'

            default:
                return 'circle'
        }
    }

    static getStatusColor(status) {
        switch (status) {
            case STORE_STATUS.MISCONFIGURED:
                return 'yellow'

            case STORE_STATUS.NOT_LIVE:
                return 'black-20'

            case STORE_STATUS.PARTIALLY_DISABLED:
                return 'black-50'

            case STORE_STATUS.DISABLED:
                return 'black'

            case 'ONLINE': //  online is a child store / storeOrderType status
            case STORE_STATUS.HEALTHY:
                return 'success'

            case 'OFFLINE': // offline is a child store / storeOrderType status
            case STORE_STATUS.UNHEALTHY:
            case STORE_STATUS.PARTIALLY_UNHEALTHY:
                return 'error'
        }
    }
}