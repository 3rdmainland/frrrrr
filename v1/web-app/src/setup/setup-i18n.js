import NandosI18n from 'nandos-i18n'
const regionSettings = require('@/' + process.env.VUE_APP_REGION + '.yml')

import LanguageService, { LANGUAGE_CHANGED } from 'nandos-middleware-api/service/my-language-service'
import { setDefaultHeader } from 'nandos-middleware-api/http'
import { CoreUiValidationMessages } from 'nandos-core-ui'

export default function (Vue) {
  Vue.use(NandosI18n, regionSettings)

  LanguageService.languages = regionSettings.languages // Pass available runtime languages to our i18n service
  NandosI18n.changeLanguage( LanguageService.language ) // Restore last used language by customer

  LanguageService.addObserver('setup-i18n', LANGUAGE_CHANGED, () => {
    let lang = LanguageService.language
    NandosI18n.changeLanguage(lang)
    CoreUiValidationMessages.overrideMessages( NandosI18n.t('formValidation') ) // Configure core UI validation to use new translations
    setDefaultHeader('Accept-Language', `${lang.baseIso}`)
  })
}