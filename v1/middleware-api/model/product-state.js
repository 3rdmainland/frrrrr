
export default class ProductState {

	constructor() {
		this.reset();
	}

	setSelected(product, value) {
		if (value) {
			this.selection[product.id] = true;
		} else {
			delete this.selection[product.id];
		}
	}

	isSelected(product) {
		return product.id in this.selection;
	}

	reset() {
		this.selection = {};
		this.orderQuantity = 1;
	}

}