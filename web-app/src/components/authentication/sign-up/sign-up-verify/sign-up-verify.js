import logger from 'nandos-dev-logger'
import Vue from 'vue'
import AuthService from 'nandos-middleware-api/service/auth-service'
import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import Customer from 'nandos-middleware-api/model/customer'
import { ViewStateService } from 'nandos-core-ui'

export default {

  data () {
    return {
      user: new Customer(),
      form_data: { otp: '' },
      server_error: null,
      loading: false,
      mobilePhoneNumber: null,
    }
  },

  computed: {
    isDesktopLayout() {
      return this.$breakpoints.mdUp
    },
  },

  created() {
    let initData = ViewStateService.getInitialisationData(this.$route.path)
    if(!initData || !initData.mobilePhoneNumber) return logger.error('Nandos Web', 'Sign up verify::', 'Missing required initialisation data')
    this.mobilePhoneNumber = initData.mobilePhoneNumber
    CustomerService.getMe()
      .then(user => this.user = user)
  },

  methods: {

    /* Automatically submit the form once it becomes valid */
    onFormValid(isValid) {
      if(isValid) this.$refs.form && this.$refs.form.submit()
    },

    onSubmit(e) {
      this.loading = true
      this.server_error = null

      AuthService.verifyRegistration(this.form_data.otp)
        .then(() => {
            let next = this.$route.query.redirect != null
              ? { path: this.$route.query.redirect }
              : { name: 'order-setup-start' }

            // Copy any query params (expect "redirect" and "jump", as we have just processed that)
            next.query = Object.fromEntries(Object.entries(this.$route.query || {}).filter(([key, value]) => key != 'redirect' && key != 'jump'))
            this.$router.push(next)
          },
          error => this.server_error = error
        )
        .finally(() => this.loading = false)
    },

    resendOtp() {
      AuthService.resendVerification(this.mobilePhoneNumber)
        .then(() => this.$toaster.show( this.$t('signUp.verify.otpResent') ))
        .catch(error => this.server_error = error)
    },
  }
  
}