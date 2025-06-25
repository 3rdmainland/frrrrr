import { type TApplicationContext } from "@nandos-types/model/application-context";
import { type IBasket } from "@nandos-types/model/basket";
import { type IMatchedCampaign } from "@nandos-types/model/campaign";
import { type IFoodBasketItem } from "@nandos-types/index";

export default class Basket<T = IFoodBasketItem> {

    public id: string;
    public totalItems: number;
    public totalPrice: number;
    public totalVat: number;
    public items?: T[];
    public maximumOrderValue: number;
    public minimumOrderValue: number;
    public customerId: string;
    public context: TApplicationContext;
    public matchedCampaigns: IMatchedCampaign[];
    public selectedFreeProductCampaignItem: string | null;

    constructor(data: IBasket<T>) {
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
        return this.totalItems == 0;
    }

    get exceedsMaximumOrderValue () {
        return this.totalPrice > this.maximumOrderValue;
    }

    get underMinimumOrderValue () {
        return this.totalPrice < this.minimumOrderValue;
    }
}