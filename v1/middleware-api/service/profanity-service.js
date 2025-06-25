import ApiHttp from '../http'
import SnippetService from './snippet-service'
import ProfanityCheck from './profanity-check'

var memCache = null

class ProfanityService {

	_getProfanities() {
		return SnippetService.getSnippet('profanities')
			.then(snippet => new ProfanityCheck(snippet.split(/\r?\n/), false))
	}

	detect(string) {
		return this._getProfanities()
			.then(checker => checker.detect(string))
	}

	sanitize(string) {
		return this._getProfanities()
			.then(checker => checker.sanitize(string))
	}
}

export default new ProfanityService()