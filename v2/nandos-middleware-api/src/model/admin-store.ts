import '../util/admin-context-guard';
import TimeSet from './time-set';
import StoreConfig from './store-config';
import StoreFacility from './authoring/store-facility';
import AdminStoreOrderType from './admin-store-order-type';
import { ORDER_TYPES } from '@nandos-types/model/order';
import { mapI18nValues } from '../service/i18n-service';
import { type I18NString } from '@nandos-types/model/language';
import {
    POS_TYPE,
    STORE_STATUS,
    OWNERSHIP_TYPE,
    type TPosType,
    type IAdminStore,
    type TStoreStatus,
    type TOwnershipType,
    type TAggregatorAmountVerificationRule,
} from '@nandos-types/model/store';

export default class AdminStore {

    public id: string;
    public posType: TPosType;
    public ownershipType: TOwnershipType;
    public code: string;
    public name: string;
    public displayName: I18NString;
    public address: I18NString;
    public kerbsideInstructions: I18NString;
    public phone: string[];
    public openingTimes: TimeSet;
    public configuration: StoreConfig;
    public storeOrderTypes: AdminStoreOrderType[];
    public facilities: StoreFacility[];
    
    public collectionCheckoutInstructions: any;
    public collectionSMSInstructions: any;

    public live: boolean;
    public visible: boolean;
    public forceOffline: boolean;
    public forceKerbsideOffline: boolean;

    public latitude: number;
    public longitude: number;

    public failoverEnabled: boolean;
    public kerbsideEnabled: boolean;
    public aggregatorAmountVerificationRule: TAggregatorAmountVerificationRule;

    public merchantCredentialsSlot1: string;
    public merchantCredentialsSlot2: string;
    public merchantCredentialsSlot3: string;
    public walletMerchantCredentialsSlot1: string;
    public walletMerchantCredentialsSlot2: string;

    public cowabungaVersion: number;
    public cowabungaStoreId: string;
    public cowabungaHubId: string;
    public cowabungaPassword: string;

    public timeZoneOffset: number;
    public timezoneDiff: number;

    constructor(data: IAdminStore) {
        this.id = data.id;
        this.posType = POS_TYPE[data.posType];
        this.ownershipType = OWNERSHIP_TYPE[data.ownershipType];
        this.code = data.code;
        this.name = data.name;
        this.displayName = mapI18nValues(data.displayName);
        this.address = mapI18nValues(data.address);
        this.kerbsideInstructions = mapI18nValues(data.kerbsideInstructions);
        this.phone = data.phone;
        this.openingTimes = data.openingTimes && new TimeSet(data.openingTimes); // opening times of physical parent store
        this.configuration = data.configuration && new StoreConfig(data.configuration);
        this.storeOrderTypes = data.storeOrderTypes && data.storeOrderTypes.map(ot => new AdminStoreOrderType(ot)).sort((a, b) => a.type.localeCompare(b.type));

        this.facilities = (data.facilities && data.facilities.map(f => new StoreFacility(f))) || [];

        this.collectionCheckoutInstructions = data.collectionCheckoutInstructions;
        this.collectionSMSInstructions = data.collectionSMSInstructions;
        this.live = !!data.live;
        this.visible = !!data.visible;
        this.forceOffline = !!data.forceOffline;
        this.forceKerbsideOffline = !!data.forceKerbsideOffline;

        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.failoverEnabled = data.failoverEnabled;
        this.kerbsideEnabled = data.kerbsideEnabled;
        this.aggregatorAmountVerificationRule = data.aggregatorAmountVerificationRule;

        this.merchantCredentialsSlot1 = data.merchantCredentialsSlot1;
        this.merchantCredentialsSlot2 = data.merchantCredentialsSlot2;
        this.merchantCredentialsSlot3 = data.merchantCredentialsSlot3;
        this.walletMerchantCredentialsSlot1 = data.walletMerchantCredentialsSlot1;
        this.walletMerchantCredentialsSlot2 = data.walletMerchantCredentialsSlot2;

        this.cowabungaVersion = data.cowabungaVersion;
        this.cowabungaStoreId = data.cowabungaStoreId;
        this.cowabungaHubId = data.cowabungaHubId;
        this.cowabungaPassword = data.cowabungaPassword;

        this.timeZoneOffset = data.timeZoneOffset; // an integer that represents offset from GMT. Eg: ZA would be 2
        this.timezoneDiff = ((new Date().getTimezoneOffset() / 60) + this.timeZoneOffset) * 60 * 60 * 1000; // computes the millisecond difference between user and store timezone
    }

    get status() {

        if (this.storeOrderTypes.length == 0 || this.storeOrderTypes.some(orderType => orderType.status == STORE_STATUS.MISCONFIGURED))
            return STORE_STATUS.MISCONFIGURED;

        else if (!this.live)
            return STORE_STATUS.NOT_LIVE;

        else if (this.disabled)
            return STORE_STATUS.DISABLED;

        else if (this.storeOrderTypes.every(orderType => !orderType.online && !orderType.disabled))
            return STORE_STATUS.UNHEALTHY;

        else if (this.storeOrderTypes.some(orderType => orderType.disabled))
            return STORE_STATUS.PARTIALLY_DISABLED;

        else if (this.storeOrderTypes.some(orderType => !orderType.online && !orderType.disabled))
            return STORE_STATUS.PARTIALLY_UNHEALTHY;

        else
            return STORE_STATUS.HEALTHY;
    }

    get disabled() {
        return this.forceOffline;
    }

    get customerDeliveryCapable() {
        return this.storeOrderTypes.some(orderType => orderType.type == ORDER_TYPES.DELIVERY && orderType.customerCapable);
    }

    get customerCollectionCapable() {
        return this.storeOrderTypes.some(orderType => orderType.type == ORDER_TYPES.COLLECTION && orderType.customerCapable);
    }

    get customerEatInCapable() {
        return this.storeOrderTypes.some(orderType => orderType.type == ORDER_TYPES.EAT_IN && orderType.customerCapable);
    }

    get customerAggregatorCapable() {
        return this.storeOrderTypes.some(orderType => orderType.type == ORDER_TYPES.AGGREGATOR && orderType.customerCapable);
    }

    get callCenterDeliveryCapable() {
        return this.storeOrderTypes.some(orderType => orderType.type == ORDER_TYPES.DELIVERY && orderType.callcentreCapable);
    }

    get callCenterCollectionCapable() {
        return this.storeOrderTypes.some(orderType => orderType.type == ORDER_TYPES.COLLECTION && orderType.callcentreCapable);
    }

    get statusIcon() {
        return AdminStore.getStatusIcon(this.status);
    }

    get statusColor() {
        return AdminStore.getStatusColor(this.status);
    }

    static getStatusIcon(status: TStoreStatus) {
        switch (status) {
            case STORE_STATUS.PARTIALLY_DISABLED:
            case STORE_STATUS.PARTIALLY_UNHEALTHY:
                return 'tonality';

            case STORE_STATUS.NOT_LIVE:
                return 'radio_button_unchecked';

            default:
                return 'circle';
        }
    }

    static getStatusColor(status: TStoreStatus) {
        switch (status) {
            case STORE_STATUS.MISCONFIGURED:
                return 'yellow';

            case STORE_STATUS.NOT_LIVE:
                return 'black-20';

            case STORE_STATUS.PARTIALLY_DISABLED:
                return 'black-50';

            case STORE_STATUS.DISABLED:
                return 'black';

            case 'ONLINE': //  online is a child store / storeOrderType status
            case STORE_STATUS.HEALTHY:
                return 'success';

            case 'OFFLINE': // offline is a child store / storeOrderType status
            case STORE_STATUS.UNHEALTHY:
            case STORE_STATUS.PARTIALLY_UNHEALTHY:
                return 'error';
        }
    }
}