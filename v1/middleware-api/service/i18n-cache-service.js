/**
 * An in memory cache that stores/retrieves entries keyed by language.
 */
class I18nCacheService {

	constructor() {
		this._cache = {}
		this.languageService = null // an instance of an language service must be configured for this cache 
	}
	
	get _language() {
		if(!this.languageService) throw new Error('i18n Cache:: No language service configured')
		return this.languageService.languageKey
	}

	get(key) {
		return this._cache[this._language] && this._cache[this._language][key]
	}

	put(key, val) {
		if(!this._cache[this._language]) this._cache[this._language] = {}
		return this._cache[this._language][key] = val
	}

	clear(key) {
		if(this._cache[this._language]) {
			delete this._cache[this._language][key]
		}
	}

	/**
	 * Clears cached values for "key" in all languages
	 */
	clearAll(key) {
		for(var lang in this._cache) {
			delete this._cache[lang][key]
		}
	}
}

export default new I18nCacheService()