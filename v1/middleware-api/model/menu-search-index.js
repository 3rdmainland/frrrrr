import ScoringService from '../service/scoring-service'

class SearchResultItem {

	constructor(product, score = 0) {
		this.product = product;
		this.score = score;
	}

}

export default class MenuSearchIndex {

	constructor(products) {
		this._index = {};
		products.forEach(p => this.indexProduct(p));
	}

	keywordSearch(keywords, limit=false) {
		let result = {};

		keywords.forEach(keyword => {
			if (keyword in this._index) {
				let matches = this._index[keyword];
				Object.keys(matches).forEach(key => {
					let product = matches[key];
					if (!(product.id in result)) {
						let [score,] = ScoringService.score(product, keywords);
						result[product.id] = new SearchResultItem(product, score);
					}
				});
			}
		});

		result = Object.keys(result)
					.map(key => result[key])
					.sort((a, b) => b.score - a.score);

		if (limit && limit < result.length) {
			result.length = limit;
		}

		return result;
	}

	indexProduct(product) {
		product.keywords && Object.keys(product.keywords).forEach(keyword => {
			if (!(keyword in this._index)) {
				this._index[keyword] = {};
			}
			this._index[keyword][product.id] = product;
		});
	}

}