export default class Language {

	constructor(data = {}) {
		this.name = data.name
    this.iso = data.iso
    this.rightToLeft = data.rightToLeft
  }

	get default() {
    return this.iso == process.env.VUE_APP_DEFAULT_LOCALE
  }

  get baseIso() { // converts a fully formed lang-region iso, like "en-ZA" to just the language component "en"
    return this.iso.split('-')[0]
  }
}