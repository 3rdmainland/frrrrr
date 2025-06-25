import { BASKET_CONTENTS_CHANGED } from 'nandos-middleware-api/service/basket/basket-service'

export default {

  props: {
    basketService: { type: Object, required: true },
    muted: Boolean,
  },

  data () {
    return {
      basket: null,
    }
  },

  computed: {
    iconClasses() {
      return {
        'nandos-pink--after': true,
      }
    },

    badgeConfig() {
      const basketTotalFromCookie = this.getBasketTotalFromCookie();

      const totalItems = this.basket ? this.basket.totalItems :
                        (basketTotalFromCookie !== null ? parseInt(basketTotalFromCookie, 10) : 0);

      return {
        value: totalItems,
        overlap: true,
        right: true,
      }
    }
  },

  created() {
    this.getBasket();
    this.basketService.addObserver(this, BASKET_CONTENTS_CHANGED, this.getBasket);
  },

  beforeDestroy() {
    this.basketService.removeObserver(this, BASKET_CONTENTS_CHANGED);
  },

  methods: {
    getBasket() {
      this.basketService.getBasketSummary()
        .then(basket => {
          this.basket = basket
          if(basket.autoModified) {
            this.$toaster.show( this.$t('basketAutoModified') )
            basket.autoModified = false
          }
        })
    },

    //get basket total from cookie
    getBasketTotalFromCookie() {
      if (!document.cookie || document.cookie === "") {
        return null;
      }
      const cookieArray = document.cookie.split(';');
      for (let i = 0; i < cookieArray.length; i++) {
        const cookiePair = cookieArray[i].trim();
        if (cookiePair.startsWith('basketTotal=')) {
          const basketTotal = cookiePair.substring('basketTotal='.length, cookiePair.length);
          return basketTotal;
        }
      }
      return null;
    }
  }
}
