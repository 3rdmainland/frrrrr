export default class ProfanityCheck {

	constructor(words = [], insideWords = true, ignoreCase = true) {
		let regexEscape = new RegExp(/[.*+?^${}()|[\]\\]/, 'g')

		let testStr = words.map(w => {
			w = w.replace(regexEscape, '\\$&')
			return insideWords ? `(${w})` : `\\b(${w})\\b`
		}).join('|')

		this.testRegex = new RegExp(testStr, 'g' + (ignoreCase ? 'i' : ''))
	}

	detect(input) {

		let result = input.match(this.testRegex)

		return result != null && result.length > 0

	}

	sanitize(input, replacement = '*') {

		let result = input + ''
		try{
			// IE 11 and Edge seem to randomly not support `matchAll`, and polyfils don't seem to help either
			let matches = input.matchAll(this.testRegex)

			for(let match of matches) {
				let sanitized = replacement.repeat(match[0].length)

				let sliceStart = match.index
				let sliceEnd = sliceStart + sanitized.length
				result = result.slice(0, sliceStart) + sanitized + input.slice(sliceEnd, input.length)
			}

			return result
		}
		catch(e) {
			return input
		}

	}

}