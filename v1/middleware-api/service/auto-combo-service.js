import ProductState from '../model/product-state'
import UserProduct from '../model/user-product'

function autocombo(basket, menu) {

	let combosForMain = menu.products.reduce((result, p) => {
		if (p.productType == "COMBO" && p.comboMain) {
			if (!(p.comboMain.definitionId in result)) {
				result[p.comboMain.definitionId] = [];
			}
			result[p.comboMain.definitionId].push(p);
		};
		return result;
	}, {});

	let candidates = [];
	let singles = [];

	(basket.items || []).forEach(item => {
		let product = menu.productMap[item.productId];
		if (product && product.productType == "SIMPLE") {
			let comboProducts = combosForMain[product.definitionId];
			if (comboProducts) {
				comboProducts.forEach(comboProduct => {
					candidates.push({"comboProduct":comboProduct, "basketItem":item});
				});
			} else {
				singles.push(item);
			}
		}
	});

	let result = [];

	candidates.forEach(c => {
		let basketItems = [c.basketItem].concat(singles);
		let match = new AutoComboMatch(basketItems, c.comboProduct, menu);

		if (match.success && match.savings > 0) {
			result.push(match);
		}
	});

	return result.sort((a, b) => b.savings - a.savings);
}

class AutoComboMatch {

	constructor(basketItems, comboProduct, menu) {
		this.comboProduct = comboProduct;
		this.replacedBasketItems = [];
		this.comboProductState = new ProductState();
		this.userProduct = new UserProduct(this.comboProduct, this.comboProductState);
		this.savings = 0;
		this.success = false;		

		this.process(basketItems, menu);
	}

	process(basketItems, menu) {
		basketItems.some(basketItem => {
			let basketProduct = menu.productMap[basketItem.productId];
			let basketProductState = basketProduct.configureFromBasketItem(basketItem, new ProductState());
			let accepted = this.incoming(basketProduct, this.comboProduct, basketProductState, this.comboProductState);

			if (accepted) {
				this.replacedBasketItems.push(basketItem);
				if (this.comboProduct.isConfigured(this.comboProductState)) {
					this.success = true;
					this.savings = this.replacedBasketItems.reduce((s, i) => s + i.productPrice, 0) - this.comboProduct.computePrice(this.comboProductState);
					return true;
				}
			}

			return false;
		});

		let verifiedItems = [];

		this.replacedBasketItems.forEach(item => {
			let matchedProduct = this.findCandidate(this.comboProduct, menu.productMap[item.productId]);
			if (this.comboProductState.isSelected(matchedProduct)) {
				verifiedItems.push(item);
			}
		});

		this.replacedBasketItems = verifiedItems;
	}

	incoming(incomingProduct, comboProduct, incomingProductState, comboProductState) {
		let candidate = this.findCandidate(comboProduct, incomingProduct);

		if (candidate) {
			if (!(candidate.parent || candidate).isConfigured(comboProductState) && this.attemptMatch(incomingProduct, candidate, incomingProductState, null)) {
				this.attemptMatch(incomingProduct, candidate, incomingProductState, comboProductState);
				return true;
			}
		}

		return false;
	}

	findCandidate(comboProduct, incomingProduct) {
		let result = null;

		if (comboProduct.definitionId == incomingProduct.definitionId) {
			result = comboProduct;
		} else if (comboProduct.relatedProducts) {
			comboProduct.relatedProducts.some(rpCombo => result = this.findCandidate(rpCombo, incomingProduct));
		}

		return result
	}

	attemptMatch(incomingProduct, comboProduct, incomingProductState, comboProductState) {
		let result = true;

		if (comboProductState) {
			comboProduct.setSelected(comboProductState, true);
		}

		(incomingProduct.relatedProducts || []).some(rpIncoming => {
			if (rpIncoming.isSelected(incomingProductState)) {
				let comboMatch = (comboProduct.relatedProducts || []).find(rpCombo => rpCombo.definitionId == rpIncoming.definitionId);
				let isMatch = comboMatch && this.attemptMatch(rpIncoming, comboMatch, incomingProductState, comboProductState);
				return !(result = isMatch);
			}

			return false;
		});

		return result;
	}

}

export default {autocombo};