import { PlaceholderBackground } from 'nandos-core-ui'
import { getMenuItemUrl } from '../menu-tile.js'
import { menuServiceKey, isPreviewKey } from '../../../../utils/ordering-provider-utils'

export default {
  
  inject: {
    menuService: menuServiceKey,
    preview: isPreviewKey,
  },

  mixins: [PlaceholderBackground],

  data() {
    return {
      supriseMeProductPredicate: (candidate) => candidate.isAvailable() && candidate.productType == 'COMBO',
      supriseMeConfigurationPredicate: (child) => child.isAvailable(),
      supriseMeCarouselProducts: [],
    }
  },

  computed: {
    classes() {
      return {
        'menu-tile menu-tile--surprise-me-tile': true,
      }
    },
  },

    created() {
      this.menuService.getRandomProducts(3, (candidate) => this.supriseMeProductPredicate(candidate) && !candidate.imageCollection.isEmpty, this.supriseMeConfigurationPredicate)
        .then(products => this.supriseMeCarouselProducts = products.filter((item, index, arr) => index === arr.findIndex(n => n.getId() === item.getId()))) // dedupe
    },

    methods: {
      surpriseMe() {
        this.menuService.getRandomProduct(this.supriseMeProductPredicate, this.supriseMeConfigurationPredicate)
          .then(userProduct => {
            this.menuService.registerUserProduct(userProduct)
            this.$router.push(getMenuItemUrl(userProduct, this.$route, this.preview))
          })
      }
    },
}

