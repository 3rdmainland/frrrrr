import type Product from "src/model/product";

function score(product: Product, keywords: string[], contextBounds = [0, 0]): [number, number[]] {
	let common = 0;
	let skips = 0;
	let skipsAcc = 0;
	let bounds = [0, 0];

	keywords.forEach((keyword, i) => {
		if (product.keywords && keyword in product.keywords) {
			bounds[1] = i;
			if (common == 0) {
				bounds[0] = i;
			} else {
				skips += skipsAcc;
				skipsAcc = 0;
			}
			common += 1;
		} else if (common > 0) {
			skipsAcc += 1;
		}
	});

	let score = cosineSimilarity(common, product, keywords);
	if (score > 0) {
		if (skips) {
			score *= 1 - ((skips / (bounds[1] - bounds[0])) * 0.1);
		}

		let distance = boudsDistance(contextBounds, bounds);
		if (distance > 0) {
			score *= 1 - ((distance / keywords.length) * 0.1);
		}

		if (bounds[0] < contextBounds[0]) {
			score *= 0.95;
		}
	} else {
		bounds = contextBounds;
	}

	return [score, bounds];
}

function boudsDistance(boundsA: number[], boundsB: number[]) {
	if (boundsB[0] > boundsA[1]) {
		return boundsB[0] - boundsA[1];
	} else if (boundsB[1] < boundsA[0]) {
		return boundsA[0] - boundsB[1];
	}

	return 0;
}

function cosineSimilarity(common: number, product: Product, keywords: string[]) {
	if (common > 0) {
		let len1 = Object.keys(product.keywords || {}).length;
		let len2 = keywords.length;
		return common / (Math.sqrt(len1) * Math.sqrt(len2));
	}

	return 0;
}

export default {score};