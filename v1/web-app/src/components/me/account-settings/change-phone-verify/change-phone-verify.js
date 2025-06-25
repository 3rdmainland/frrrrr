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
    }
  },

  created() {
    let initData = ViewStateService.getInitialisationData(this.$route.path)
    if(!initData || !initData.mobilePhoneNumber) return logger.error('Nandos Web', 'Change phone number verify::', 'Missing required initialisation data')
    this.mobilePhoneNumber = initData.mobilePhoneNumber
  },
  
  methods: {

    /* Automatically submit the form once it becomes valid */
    onFormValid(isValid) {
      if(isValid) this.$refs.form && this.$refs.form.submit()
    },
  
    onSubmit() {
      this.loading = true;
      this.server_error = null;

      AuthService.verifyChangeMobilePhone(this.mobilePhoneNumber, this.form_data.otp)
        .then(
          () => {
            this.$toaster.show( this.$t('profile.settings.changePhone.verify.updated') )
            this.$router.push('/me');
          },
          error => this.server_error = error
        )
        .then(() => this.loading = false)
    },

    resendOtp() {
      AuthService.changeMobilePhone(this.mobilePhoneNumber)  // re-request mobile number change
        .then(() => this.$toaster.show( this.$t('profile.settings.changePhone.verify.otpResent') ))
        .catch(error => this.server_error = error)
    },
  },
}