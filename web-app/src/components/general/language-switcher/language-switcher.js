import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import LanguageService from 'nandos-middleware-api/service/my-language-service'

export default {

  data() {
    return {
      languageService: LanguageService,
    }
  },

  watch: {
    'languageService.language'() {
      CustomerService.updateLanguagePreference(this.languageService.language.baseIso)
    }
  },
}