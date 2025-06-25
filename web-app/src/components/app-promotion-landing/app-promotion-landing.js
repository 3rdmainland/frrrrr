import AppSplashService from 'nandos-middleware-api/service/app-splash-service'
import MenuService from 'nandos-middleware-api/service/menu/my-menu-service'
import BasketService from 'nandos-middleware-api/service/basket/my-basket-service'
import GlobalConfigService from 'nandos-middleware-api/service/global-config-service'
import LanguageService from 'nandos-middleware-api/service/my-language-service'
import { menuServiceKey, basketServiceKey, globalConfigServiceKey, languageServiceKey, isPreviewKey } from 'nandos-ordering/src/utils/ordering-provider-utils'

export default {

  provide () {
    return {
      [menuServiceKey]: MenuService,
      [basketServiceKey]: BasketService,
      [globalConfigServiceKey]: GlobalConfigService,
      [languageServiceKey]: LanguageService,
      [isPreviewKey]: false,
    }
  },

  data() {
    return {
      category: null,
    }
  },

  computed: {
    showFooter() {
      return this.category && !this.category.isEmpty
    },
  },

  created() {
    AppSplashService.getAppSplashPromotions()
      .then(category => {
        if(category.isEmpty) { // If there are no promotions, go to normal landing page
          // Be careful about redirecting to another page, in case the app was opened from a push message that linked somewhere else
          if(this.$route.path == '/app-promos') this.$router.push('/')
        }
        
        this.category = category
      })
  },
}