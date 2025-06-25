import AuthService from 'nandos-middleware-api/service/auth-service'
import BasketService from 'nandos-middleware-api/service/basket/my-basket-service'
import Tracker from 'nandos-tracking'
import { getRecaptchaToken } from 'nandos-core-ui/src/utils/google-recaptcha'

export default {

  data () {
    return {
      form_data: { password: '', mobilePhoneNumber: '' },
      server_error: null,
      loading: false,
      TERMS_AND_CONDITIONS_URL: process.env.VUE_APP_TERMS_AND_CONDITIONS_URL,
      FAQ_URL: process.env.VUE_APP_FAQ_URL,
    }
  },

  computed: {
    isDesktopLayout() {
      return this.$breakpoints.mdUp
    },

    isIosApp() {
      return this.$isCordovaApp && process.env.VUE_APP_CONTEXT == 'IOS'
    },
  },

  methods: {

    onSubmit(e) {
      this.loading = true;
      this.server_error = null;

      getRecaptchaToken('sign_in')
        .then((token) => AuthService.mobileLogin(this.form_data.mobilePhoneNumber, this.form_data.password, token))
        .then(user => {
          Tracker.track('login', 'mobile')

          return BasketService.getBasketSummary()
            .then(basket => {
              let next = this.$route.query.redirect != null
                ? { path: this.$route.query.redirect }
                : { name: basket.isOrderSetup ? 'menu' : 'order-setup-start' }

              // Copy any query params (expect "redirect" and "jump", as we have just processed that)
              next.query = Object.fromEntries(Object.entries(this.$route.query || {}).filter(([key, value]) => key != 'redirect' && key != 'jump'))

              if(this.$route.query.intermediary){
                window.location.href = next.path
              }else {
                this.$router.push(next)
              }
            })
        })
        .catch(error => this.server_error = error)
        .finally(() => this.loading = false)
    },
  },

}