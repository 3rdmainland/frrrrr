import { type IFoodBasketItem } from '@nandos-types/model/food-basket-item';

export default class FoodBasketItem {

	public id: string;
	public computedDescription: string;
	public productId: string;
	public productName: string;
	public productPrice: number;
	public quantity: number;
	public subItems: FoodBasketItem[];
	public oheicsId: number;
	public available: boolean;
	public exclusions: any[];
	public image: any;

	constructor(data: IFoodBasketItem) {
		this.id = data.id;
		this.computedDescription = data.computedDescription;
		this.productId = data.productId;
		this.productName = data.productName;
		this.productPrice = data.productPrice;
		this.quantity = data.quantity;
		this.subItems = data.subItems && data.subItems.map(i => new FoodBasketItem(i));
		this.oheicsId = data.oheicsId;
		this.available = true; // will be managed by `ProductAvailabilityService`
		this.exclusions = []; // will be managed by `ProductAvailabilityService`
		this.image = data.image; // will be managed by `ProductAvailabilityService`
	}

	get allExlcusions() {
		return this.collect(item => item.exclusions)
			.filter(reasons => reasons.length > 0)
			.reduce((prev, curr) => prev.concat(curr), []); // flatten results
	}

	get allItemsAvailable() {
		return this.allExlcusions.length == 0;
	}

	collect(test: (item: FoodBasketItem) => FoodBasketItem[], result: FoodBasketItem[][] = []) {
		result.push(test(this));
		if(this.subItems) this.subItems.forEach(si => si.collect(test, result));
		return result;
	}
}