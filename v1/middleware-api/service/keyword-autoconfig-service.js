
function autoconfigure(product, keywords, productState) {
	return new Autoconfigurator(product, keywords, productState);
}

class Autoconfigurator {

	constructor(product, keywords, productState) {

		this.product = product;
		this.hits = 0;

		this.keywordStates = keywords.map((keyword, index) => {
			return new KeywordState(keyword, index);
		});

		this.node = new AutoconfigNode(this, product, null);

		this.node.prune();

		this.keywordStates.forEach(ks => {
			ks.prune();
		});

		this.node.rescore();
		
		this.node.select(productState);
	}

}

class AutoconfigNode {

	constructor(context, product, parent) {
		this.context = context;
		this.product = product;
		this.parent = parent;
		this.identifier = this._createIdentifier();
		this.statefulParent = this._getStatefulParent();
		this.children = [];
		this.isStateful = this.product.productType == "SIMPLE" || this.product.productType == "CONDIMENT" || (this.product.isLeaf() && this.product.productType != "COMBO_MAIN");
		this.matches = {};
		this.position = 0;
		this.score = 0;

		if (this.isStateful) {
			this._match();
		}

		if (this.product.relatedProducts && (!this.isStateful || this.score > 0)) {
			this.product.relatedProducts.forEach(rp => {
				let child = new AutoconfigNode(context, rp, this);
				if ((!child.isStateful && child.children.length > 0) || (child.isStateful && child.score > 0)) {
					this.children.push(child);
				}
			});
		}
	}

	_match() {
		let candidates = {};

		this.context.keywordStates.forEach((ks, i) => {
			if (ks.keyword in this.product.keywords) {
				if (!(ks.keyword in candidates)) {
					candidates[ks.keyword] = [];
				} 
				candidates[ks.keyword].push(ks);
			}
		});

		if (Object.keys(candidates).length == 0) {
			return;
		}

		let parentPosition = this.statefulParent ? this.statefulParent.position : 0;

		Object.keys(candidates).forEach(k => {
			if (candidates[k].length > 1) {
				candidates[k].sort((a, b) => {
					let result = Math.abs(a.index - parentPosition) - Math.abs(b.index - parentPosition);
					if (result == 0) {
						result = b.index - a.index;
					}
					return result;
				});
			}
			let match = candidates[k][0];
			this.matches[match.index] = match;
			match.associate(this);
		});

		this._calculateScore();
	}

	prune() {
		if (this.children.length > 0) {
			if (this.product.quantity == 1 && !this.children.filter(c => {return !c.product.isLeaf();}).length) {
				this.children.sort((a, b) => {
					return b.score - a.score;
				});
				let leftovers = this.children;
				this.children = this.children.slice(0, 1);
				leftovers = leftovers.slice(1, leftovers.length);
				leftovers.forEach(l => {
					Object.keys(l.matches).forEach(mk => {
						l.matches[mk].dissociate(l);
					});
					l.matches= {};
				});
			} else {
				this.children.forEach(c => {
					c.prune();
				});
			}
		}
	}

	rescore() {
		let result = 0;

		if (this.isStateful) {
			this._calculateScore();
		}

		this.children.forEach(c => {
			result += c.rescore();
		});

		if (!result) {
			this.children = [];
		} else {
			this.children.sort((a, b) => {
				return b.score - a.score;
			});
		}

		if (this.isSelectable()) {
			result += this.score;
		}

		return result;
	}

	select(productState) {
		if (this.isSelectable()) {
			this.product.select(productState);
			if (!this.product.isAlwaysSelected(productState)) {
				this.context.hits += 1;
			}
		}

		if (!this.isStateful || this.score > 0) {
			for (var i = 0; i < this.children.length; i++) {
				this.children[i].select(productState)
			}
		}
	}

	isSelectable() {
		return this.isStateful && !this.product.isRoot() && this.score > 0 && !this.product.hasMandatory;
	}

	_calculateScore() {
		this.score = 0;
		let common = Object.keys(this.matches).length;

		if (common > 0) {
			this.position = 0;
			Object.keys(this.matches).forEach(k => {
				this.position += this.matches[k].index;
			});
			this.position /= common;

			let len1 = Object.keys(this.product.keywords).length;
			let len2 = this.context.keywordStates.length;
			this.score = common / (Math.sqrt(len1) * Math.sqrt(len2));

			let parentPosition = this.statefulParent ? this.statefulParent.position : 0;
			let distance = Math.abs(parentPosition - this.position);
			distance = 1 - (distance / this.context.keywordStates.length);
			this.score *= distance;
		}

		if (this.statefulParent) {
			this.score *= this.statefulParent.score;
		}
	}

	_createIdentifier() {
		return (this.parent ? this.parent.identifier : "") + this.product.id;
	}

	_getStatefulParent() {
		let result = null;
		if (this.parent != null) {
			result = this.parent.isStateful ? this.parent : this.parent._getStatefulParent();
		}
		return result;
	}

}

class KeywordState {

	constructor(keyword, index) {
		this.keyword = keyword;
		this.index = index;
		this.associations = {};
		this.match = null;
	}

	associate(node) {
		this.associations[node.identifier] = node;
	}

	dissociate(node) {
		delete this.associations[node.identifier];
	}

	prune() {
		let keys = Object.keys(this.associations);
		if (keys.length > 0) {
			keys.sort((a, b) => {
				return this.associations[b].score - this.associations[a].score;
			});

			this.match = this.associations[keys[0]];
			for (var i = 1; i < keys.length; i++) {
				delete this.associations[keys[i]].matches[this.index];
			}
			this.associations = {};
		}
	}

}

export default {autoconfigure};