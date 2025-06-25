import MenuService from 'nandos-middleware-api/service/menu/my-menu-service'
import BasketService from 'nandos-middleware-api/service/basket/my-basket-service'
import LanguageService from 'nandos-middleware-api/service/my-language-service'
import GlobalConfigService from 'nandos-middleware-api/service/global-config-service'
import { menuServiceKey, basketServiceKey, globalConfigServiceKey, languageServiceKey, isPreviewKey } from 'nandos-ordering/src/utils/ordering-provider-utils'
import { TYPES } from 'nandos-middleware-api/model/system-notification'

export default {

  props: {
    category: { type: Object /*MenuDisplayItem*/},
  },

  provide () {
    return {
      [menuServiceKey]: MenuService,
      [basketServiceKey]: BasketService,
      [globalConfigServiceKey]: GlobalConfigService,
      [languageServiceKey]: LanguageService,
      [isPreviewKey]: false,
    }
  },

  data () {
    return {
      showDialog: undefined,
    }
  },

  computed: {
    ready() {
      return this.category != null
    },

    persistent() {
      return this.ready && this.category.children && this.category.children.some(child => {
        return child.promotion.type == TYPES.PERSISTENT_SYSTEM_NOTICE
      })
    },
  },

  watch: {
    category() {
      this.showDialog = this.ready && !this.category.isEmpty
    },

    showDialog(newVal, oldVal) {
      // Dialog was shown and then closed by user
      if(oldVal !== undefined && newVal == false) {
        // Wait for animation to finish and then destroy (makes sure any promos that contained youtube videos etc are also killed)
        setTimeout(() => this.$destroy(true), 500) 
      }
    }
  },
}