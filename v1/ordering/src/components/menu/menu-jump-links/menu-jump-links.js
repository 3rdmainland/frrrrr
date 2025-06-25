import NavigationService from 'nandos-middleware-api/service/navigation-service'
import { Toggleable } from 'nandos-core-ui'
import { languageServiceKey } from '../../../utils/ordering-provider-utils'

export default {
  
  inject: {
    languageService: languageServiceKey,
  },

  mixins: [ Toggleable ],

  props: {
    menuListItems: Array,
  },

  data() {
    return {
      downloadableMenus: null,
    }
  },

  created() {
    this.getDownloadableMenus()
  },

  watch: {
    'languageService.language': 'getDownloadableMenus'
  },

  methods: {
    getDownloadableMenus() {
      return NavigationService.getDownloadableMenus()
        .then(menus => this.downloadableMenus = menus)
    },
  }
}