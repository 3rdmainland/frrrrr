
function autoconfigure(product, productState) {
	if (product.userRelevance > 0 && product.isSelectable()) {
		product.select(productState);
	}

	if (product.relatedProducts) {
		let children = product.relatedProducts.slice();
		children.sort((a, b) => {
			return b.userRelevance - a.userRelevance;
		});
		let quantity = Math.min(product.quantity || children.length, children.length);

		for (var i = 0; i < quantity; i++) {
			autoconfigure(children[i], productState);
		}
	}
}

export default {autoconfigure};