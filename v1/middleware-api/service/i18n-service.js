import Observable from '../util/observable'
import Language from '../model/language'

export const LANGUAGE_CHANGED = 'LANGUAGE_CHANGED'

export default class LanguageService extends Observable {

	constructor() {
		super()
		this._currentLanguage = null
		this._languages = null // languages need to be set from region file
	}

	get _localStorageKey() {
		throw new Error('This method must be implemented by the parent class')
	}

	/**
	 * Returns a list of languages for the region.
	 */
	get languages() {
		if(!this._languages) throw new Error('LanguageService:: Languages unavailable.')
		return this._languages
	}

	set languages(vals) {
		this._languages = vals.map(l => new Language(l))
		if(!this._currentLanguage) this._currentLanguage = this.language
	}

	/**
	 * Returns the current language being used
	 */
	get language() {

		if (! this._currentLanguage) {
			try {
				let saved = JSON.parse( localStorage.getItem(this._localStorageKey) )
				this._currentLanguage = this.languages.find(lang => lang.iso == saved)
				if(!this._currentLanguage) throw new Error('NO_PREFERENCE_FOUND')					
			}
			catch(e) {
				// If no suitable language preference was found in local storage, or local storage unavailable
				this._currentLanguage = this.defaultLanguage || this.languages[0]
			}
		}

		return this._currentLanguage
	}

	set language(newVal) {
		let oldVal = this._currentLanguage
		this._currentLanguage = newVal
		this.notifyObservers(LANGUAGE_CHANGED, newVal, oldVal)

		try {
			localStorage.setItem(this._localStorageKey, JSON.stringify(this.languageKey))
		}
		catch(e) {}
	}

	/**
	 * Returns the full iso code of the currently selected language. Eg: `en-ZA`
	 */
	get languageKey() {
		return this.language.iso
	}

	/**
	 * Returns the base iso code of the currently selected language. Eg: `en` for a language with an iso of `en-ZA` 
	 */
	get languageBaseKey() {
		return this.language.baseIso
	}

	get rtl() {
		return this.language.rightToLeft
	}

	/**
	 * Returns the default language for the region
	 */
	get defaultLanguage() {

		return this.languages.find(lang => lang.default)
	}

	/**
	 * Attempts to change the current language to match the customer's preferred language
	 */
	setLanguageFromCustomer(customer) {
		let match = this.languages.find(lang => lang.baseIso == customer.preferredLanguage)
		if(match && match.iso != this.languageKey) this.language = match
	}
}

/**
 * Utility that processes a "language object" and executes a function on the value of each language.
 * 
 * Example usage:
 *   mapI18nValues({en: [1,2,3], ar: [4,5]}, l => l.map(x => x * 2))
 *   will return: {en: [2,4,6], ar: [8,10]}
 */
export function mapI18nValues(dict, processorFn) {
	if(dict != null && typeof(dict) !== 'object')
		throw new Error('1st parameter should be an object keyed by language')
	else if(dict == null)
		return {}
	else if(processorFn == null)
		return dict
	else
		return Object.entries(dict)
			.reduce((result, [lang, langValue]) => {
				result[lang] = processorFn(langValue)
				return result
			}, {})
}