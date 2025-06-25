import ApiHttp from '../http';
import Cache from './i18n-cache-service';
import type { ISearchKeyword, TSearchKeywordCollector } from '@nandos-types/service/search-keyword';

const CACHE_KEY = 'keyword-synonym-index';

class KeywordService {

	constructor() {}

	extractKeywords(s: string, minLen = 3) {
		let result: string[] = [];
		if (s) {
			result = s.toLowerCase()
					.replace(/[^A-Za-z0-9\/]+/g," ") // Regionalisation risk 11
					.replace(/(\s|\n)+/g," ")
					.trim()
					.split(" ")
					.filter(keyword => keyword.length >= minLen)
		}
		return result;
	}

	resolveKeywords(s: string) {
		let keywords = this.extractKeywords(s);

		return this._getSynonymIndex()
			.then(synonymIndex => {
				const result: string[] = [];
				keywords.forEach(keyword => {
					if (keyword in synonymIndex && !(keyword in synonymIndex[keyword])) {
						Object.keys(synonymIndex[keyword]).map(key => result.push(key));
					} else {
						result.push(keyword);
					}
				})

				return result;
			});
	}

	private async _getSynonymIndex(): Promise<TSearchKeywordCollector> {
		// Check Cache
		const cachedKeywords = Cache.get(CACHE_KEY);
		if (cachedKeywords) return cachedKeywords;
		// Fetch and put in cache
		const keywordData = await ApiHttp.get('keywords');
		const keywords = this._buildIndex(keywordData, {});
		Cache.put(CACHE_KEY, keywords);

		return keywords;
	}

	private _buildIndex(keywordData: Record<string, any>, collector: TSearchKeywordCollector) {
		let keywords = keywordData.data.keywords as ISearchKeyword[];
		keywords.forEach(keyword => this._registerKeyword(keyword, collector))
		return collector
	}

	private _registerKeyword(keyword: ISearchKeyword, collector: TSearchKeywordCollector) {
		if (keyword.name) {
			let synonyms = this.extractKeywords(keyword.synonyms);
			synonyms = synonyms.concat(this.extractKeywords(keyword.name))
			synonyms.forEach(s => this._registerSynonym(s, keyword.name, collector))
		}
	}

	private _registerSynonym(synonym: string, keywordName: string, collector: TSearchKeywordCollector) {
		keywordName = keywordName.toLowerCase();
		if (synonym.length > 3) {
			this._registerSynonym(synonym.substring(0, synonym.length - 1), keywordName, collector);
		}
		if (!(synonym in collector)) {
			collector[synonym] = {};
		}
		collector[synonym][keywordName] = keywordName;
	}

}

export default new KeywordService();