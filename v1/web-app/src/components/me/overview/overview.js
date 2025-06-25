import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import AuthService from 'nandos-middleware-api/service/auth-service'
import Customer from 'nandos-middleware-api/model/customer'

export default {

  data () {
    return {
      REGION_SUPPORTS_GIFT_CARDS: process.env.VUE_APP_REGION_SUPPORTS_GIFT_CARDS,
      user: new Customer(),
      deleteAccountConfirmation: {
        show: false,
        loading: false,
        formError: null,
        otpSending: false,
        formData: { otp: null },
      },
    }
  },

  created() {
    CustomerService.getMe()
      .then(user => this.user = user)
  },

  methods: {
    logout() {
      AuthService.logOut()
        .then(() => {
          this.$router.push('/')
          this.$toaster.show( this.$t('profile.logOut.didLogOut') )
        });
    },

    startAccountDeletion() {
      this.deleteAccountConfirmation.otpSending = true

      AuthService.startAccountDeletion()
        .then(() => this.deleteAccountConfirmation.show = true)
        .finally(() => this.deleteAccountConfirmation.otpSending = false)
    },

    deleteAccount() {
      this.deleteAccountConfirmation.loading = true
      this.deleteAccountConfirmation.formError = null

      AuthService.verifyAccountDeletion(this.deleteAccountConfirmation.formData.otp)
        .then(() => {
          this.$router.push('/')
          this.$toaster.show( this.$t('profile.delete.didDelete') )
        })
        .catch(error => this.deleteAccountConfirmation.formError = error) 
        .finally(() => this.deleteAccountConfirmation.loading = false)
    },
  },
}