import { headerNavItems } from '@/navigation'
import LanguageService from 'nandos-middleware-api/service/my-language-service'

export default {

  data() {
    return {
      languageService: LanguageService,
      highlighted: null,
      links: null,
    }
  },

  watch: {
    'languageService.language': 'getNav'
  },

  created() {
    this.getNav()
  },

  methods: {
    getNav() {
      return headerNavItems().then(links => this.links = links)
    },
  },
}