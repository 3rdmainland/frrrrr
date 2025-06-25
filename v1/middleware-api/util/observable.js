
export default class Observable {

	constructor() {
		this.observers = {};
	}

	addObserver(context, key, behavior) {
		if(!context) throw new Error('addObserver:: Missing 1st argument - context can\'t be null');
		if(!key) throw new Error('addObserver:: Missing 2nd argument - key can\'t be null');
		if(!behavior) throw new Error('addObserver:: Missing 3rd argument - behavior can\'t be null');

		if (!this.observers[key]) {
			this.observers[key] = [];
		}
		this.observers[key].push({context, behavior});
	}

	removeObserver(context, key) {
		if(!this.observers[key]) return;
		this.observers[key] = this.observers[key].filter(item => item.context !== context)
		if (this.observers[key].length == 0) {
			delete this.observers[key];
		}
	}

	notifyObservers(key, ...rest) {
		if(this.observers[key]) {
			this.observers[key].forEach(item => item.behavior(...rest));
		}
	}
}