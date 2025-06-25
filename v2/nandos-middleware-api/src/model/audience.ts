import { Product } from './authoring/menu-entity/internal';
import type { IAudience } from '@nandos-types/model/audience'; 

export default class Audience {

    public firstPurchaseOnly: boolean;
    public registeredCustomersOnly: boolean;
    public singleRedemptionOnly: boolean;
    public minBasketAmount: number;
    public orderTypes: string;
    public contexts: string;
    public basketProducts: Product[];
    public basketExclusions: Product[];
    public specificMobilePhoneNumbers: string;
    public dailyCampaignRedemptionLimit: number;
    public redemptionLimitMsg: string;
    public disqualifyingMsg: string;
    public futureOrdersOnly: boolean;

    constructor(data: IAudience = {
        firstPurchaseOnly: false,
        registeredCustomersOnly: false,
        singleRedemptionOnly: false,
        minBasketAmount: 0,
        orderTypes: '',
        contexts: '',
        basketProducts: [],
        basketExclusions: [],
        specificMobilePhoneNumbers: '',
        dailyCampaignRedemptionLimit: 0,
        redemptionLimitMsg: '',
        disqualifyingMsg: '',
        futureOrdersOnly: false
    }) {
        this.firstPurchaseOnly = !!data.firstPurchaseOnly;
        this.registeredCustomersOnly = !!data.registeredCustomersOnly;
        this.singleRedemptionOnly = !!data.singleRedemptionOnly;
        this.minBasketAmount = data.minBasketAmount;
        this.orderTypes = data.orderTypes;
        this.contexts = data.contexts;
        this.basketProducts = (data.basketProducts || []).map(p => new Product(p));
        this.basketExclusions = (data.basketExclusions || []).map(p => new Product(p));
        this.specificMobilePhoneNumbers = data.specificMobilePhoneNumbers;
        this.dailyCampaignRedemptionLimit = data.dailyCampaignRedemptionLimit;
        this.redemptionLimitMsg = data.redemptionLimitMsg;
        this.disqualifyingMsg = data.disqualifyingMsg;
        this.futureOrdersOnly = data.futureOrdersOnly;
    }
}