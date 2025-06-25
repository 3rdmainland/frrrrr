import AuthService from 'nandos-middleware-api/service/auth-service'
import { ViewStateService } from 'nandos-core-ui'
import Tracker from 'nandos-tracking'
import { getRecaptchaToken } from 'nandos-core-ui/src/utils/google-recaptcha'

export default {

  data () {
    return {      
      form_data: { name: null, lastName: null, password: null, mobilePhoneNumber: null, marketingOptIn: null, loyaltyNumber: null },
      server_error: null,
      loading: false,
      LOYALTY_PROGRAM: process.env.VUE_APP_LOYALTY_PROGRAM,
      TERMS_AND_CONDITIONS_URL: process.env.VUE_APP_TERMS_AND_CONDITIONS_URL,
      FAQ_URL: process.env.VUE_APP_FAQ_URL,
    }
  },

  computed: {
    isDesktopLayout() {
      return this.$breakpoints.mdUp
    },
  },

  methods: {

    onSubmit(e) {
      this.loading = true;
      this.server_error = null;

      getRecaptchaToken('sign_up')
        .then(token => AuthService.passwordRegister(this.form_data, token))
        .then(
          () => {
            Tracker.track('signUp', 'mobile')
            
            let path = '/sign-up/verify'
            ViewStateService.setInitialisationData(path, {mobilePhoneNumber:this.form_data.mobilePhoneNumber})
            this.$router.push({path, query: this.$route.query})
          },
          error => this.server_error = error
        )
        .then(() => this.loading = false);
    }
  }
  
}