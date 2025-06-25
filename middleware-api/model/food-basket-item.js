export default class FoodBasketItem {

	constructor(data) {
		this.id = data.id;
		this.computedDescription = data.computedDescription;
		this.productId = data.productId;
		this.productName = data.productName;
		this.productPrice = data.productPrice;
		this.quantity = data.quantity;
		this.subItems = data.subItems && data.subItems.map(i => new FoodBasketItem(i));
		this.oheicsId = data.oheicsId;
		this.available = true // will be managed by `ProductAvailabilityService`
		this.exclusions = [] // will be managed by `ProductAvailabilityService`
	}

	get allExlcusions() {
		return this.collect(item => item.exclusions)
			.filter(reasons => reasons.length > 0)
			.reduce((prev, curr) => prev.concat(curr), []) // flatten results
	}

	get allItemsAvailable() {
		return this.allExlcusions.length == 0
	}

	collect(test, result = []) {
		result.push( test(this) )

		if(this.subItems)
			this.subItems.forEach(si => si.collect(test, result))
		
		return result
	}
}