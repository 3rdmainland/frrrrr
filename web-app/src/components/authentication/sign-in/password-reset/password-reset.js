import AuthService from 'nandos-middleware-api/service/auth-service'
import { ViewStateService } from 'nandos-core-ui'
import { getRecaptchaToken } from 'nandos-core-ui/src/utils/google-recaptcha'

export default {

  data () {
    return {
      form_data: { password: '', mobilePhoneNumber: '' },
      server_error: null,
      loading: false,
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

      getRecaptchaToken('password_reset')
        .then(token => AuthService.resetPassword(this.form_data.mobilePhoneNumber, this.form_data.password, token))      
        .then(
          () => {
            let path = '/sign-in/password-reset/verify'
            ViewStateService.setInitialisationData(path, { mobilePhoneNumber: this.form_data.mobilePhoneNumber, password: this.form_data.password})
            this.$router.push({path, query: this.$route.query})
          },
          error => this.server_error = error
        )
        .then(() => this.loading = false);
    }
  }
  
}