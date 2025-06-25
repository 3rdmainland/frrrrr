import logger from 'nandos-dev-logger'
import Vue from 'vue'
import AuthService from 'nandos-middleware-api/service/auth-service'
import { ViewStateService } from 'nandos-core-ui'

export default {

  data () {
    return {
      form_data: { otp: '' },
      server_error: null,
      loading: false,
      mobilePhoneNumber: null,
      password: null,
    }
  },

  computed: {
    isDesktopLayout() {
      return this.$breakpoints.mdUp
    },
  },

  created() {
    let initData = ViewStateService.getInitialisationData(this.$route.path)
    if(!initData || !initData.mobilePhoneNumber || !initData.password) return logger.error('Nandos Web', 'Password reset::', 'Missing required initialisation data')
    this.mobilePhoneNumber = initData.mobilePhoneNumber
    this.password = initData.password
  },

  methods: {

    /* Automatically submit the form once it becomes valid */
    onFormValid(isValid) {
      if(isValid) this.$refs.form && this.$refs.form.submit()
    },

    onSubmit(e) {
      this.loading = true;
      this.server_error = null;

      AuthService.verifyResetPassword(this.mobilePhoneNumber, this.form_data.otp)
        .then(() => {
            this.$router.push(this.$route.query.redirect ? this.$route.query.redirect : '/'),
            this.$toaster.show(this.$t('signIn.passwordReset.verify.success'))
          },
          error => this.server_error = error
        )
        .then(() => this.loading = false);
    },

    resendOtp() {
      AuthService.resetPassword(this.mobilePhoneNumber, this.password) // re-request password reset to get a new OTP
        .then(() => this.$toaster.show(this.$t('signIn.passwordReset.verify.otpResent')))
        .catch(error => this.server_error = error)
    },
  }
  
}