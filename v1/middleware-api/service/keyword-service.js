import ApiHttp from '../http'
import Cache from './i18n-cache-service'

const CACHE_KEY = 'keyword-synonym-index'

class KeywordService {

	constructor() {
		this._synonymIndex = null
	}

	extractKeywords(s, minLen = 3) {
		let result = []
		if (s) {
			result = s.toLowerCase()
					.replace(/[^A-Za-z0-9\/]+/g," ") // Regionalisation risk 11
					.replace(/(\s|\n)+/g," ")
					.trim()
					.split(" ")
					.filter(keyword => keyword.length >= minLen)
		}
		return result
	}

	resolveKeywords(s) {
		let keywords = this.extractKeywords(s)

		return this._getSynonymIndex()
			.then(synonymIndex => {
				let result = []
				keywords.forEach(keyword => {
					if (keyword in synonymIndex && !(keyword in synonymIndex[keyword])) {
						Object.keys(synonymIndex[keyword]).map(key => result.push(key))
					} else {
						result.push(keyword)
					}
				})

				return result
			})
	}

	_getSynonymIndex() {
		return Cache.get(CACHE_KEY) ||
			Cache.put(CACHE_KEY, ApiHttp.get('keywords')
				.then(keywordData => this._buildIndex(keywordData, {})))
	}

	_buildIndex(keywordData, collector) {
		let keywords = keywordData.data.keywords
		keywords.forEach(keyword => this._registerKeyword(keyword, collector))
		return collector
	}

	_registerKeyword(keyword, collector) {
		if (keyword.name) {
			let synonyms = this.extractKeywords(keyword.synonyms)
			synonyms = synonyms.concat(this.extractKeywords(keyword.name))
			synonyms.forEach(s => this._registerSynonym(s, keyword.name, collector))
		}
	}

	_registerSynonym(synonym, keywordName, collector) {
		keywordName = keywordName.toLowerCase()
		if (synonym.length > 3) {
			this._registerSynonym(synonym.substring(0, synonym.length - 1), keywordName, collector)
		}
		if (!(synonym in collector)) {
			collector[synonym] = {}
		}
		collector[synonym][keywordName] = keywordName
	}

}

export default new KeywordService()