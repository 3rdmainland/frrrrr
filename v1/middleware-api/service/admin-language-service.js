import '../util/admin-context-guard'
import LanguageService from './i18n-service'
import Cache from './i18n-cache-service'

class AdminLanguageService extends LanguageService {

	constructor() {
		super()
		Cache.languageService = this // the i18n-cache needs to be configured to use this instance so it can query the current language
	}

	/**
	 * @override
	 */
	get _localStorageKey() {
		return 'nandos-admin-authoring-language'
	}
}

export default new AdminLanguageService()
export { LANGUAGE_CHANGED, mapI18nValues } from './i18n-service'