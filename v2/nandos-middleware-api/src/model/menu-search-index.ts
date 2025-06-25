import ScoringService from '../service/scoring-service';
import type Product from './product';

class SearchResultItem {

	public product: Product;
	public score: number;

	constructor(product: Product, score = 0) {
		this.product = product;
		this.score = score;
	}

}

export default class MenuSearchIndex {

	private _index: Record<string, Record<string, Product>>;

	constructor(products: Product[]) {
		this._index = {};
		products.forEach(p => this.indexProduct(p));
	}

	keywordSearch(keywords: string[], limit: boolean | number = false) {
		const result: Record<string, SearchResultItem> = {};

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

		const searchResults = Object.keys(result)
					.map(key => result[key])
					.sort((a, b) => b.score - a.score);

		if (limit && typeof limit === "number" && limit < searchResults.length) {
			searchResults.slice(0, limit + 1);
		}

		return result;
	}

	indexProduct(product: Product) {
		product.keywords && Object.keys(product.keywords).forEach(keyword => {
			if (!(keyword in this._index)) {
				this._index[keyword] = {};
			}
			this._index[keyword][product.id] = product;
		});
	}

}