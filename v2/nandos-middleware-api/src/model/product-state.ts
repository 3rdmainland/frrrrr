import type Product from "./product";

export default class ProductState {

	public selection: Record<string, boolean>;
	public orderQuantity: number;

	constructor() {
		this.selection = {};
		this.orderQuantity = 1;
	}

	setSelected(product: Product, value: boolean) {
		if (value) {
			this.selection[product.id] = true;
		} else {
			delete this.selection[product.id];
		}
	}

	isSelected(product: Product) {
		return product.id in this.selection;
	}

	reset() {
		this.selection = {};
		this.orderQuantity = 1;
	}

}