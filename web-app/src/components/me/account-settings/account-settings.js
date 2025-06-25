import AuthService from 'nandos-middleware-api/service/auth-service'
import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import Customer from 'nandos-middleware-api/model/customer'
import { ViewStateService } from 'nandos-core-ui'

export default {

  data () {
    return {
      user: new Customer(),
      password_form_data: { old: '', new: '' },
      password_server_error: null,
      cellphone_form_data: { mobilePhoneNumber: '' },
      cellphone_server_error: null,
      loading: false,
    }
  },

  created() {
    CustomerService.getMe()
      .then(user => this.user = user)
  },

  methods: {
    changePassword(){
      this.loading = true;
      AuthService.changePassword(this.password_form_data.old, this.password_form_data.new)
        .then(
          () => {
            this.$router.push('/me');
            this.$toaster.show( this.$t('profile.settings.changePassword.updated') )
          },
          error => this.password_server_error = error
        )
        .then(() => this.loading = false)
    },

    changeCellphone(){
      this.loading = true;
      AuthService.changeMobilePhone(this.cellphone_form_data.mobilePhoneNumber)
        .then(
          () => {
            let path = '/me/settings/verify-change-phone'
            ViewStateService.setInitialisationData(path, { mobilePhoneNumber: this.cellphone_form_data.mobilePhoneNumber})
            this.$router.push(path)
          },
          error => this.cellphone_server_error = error
        )
        .then(() => this.loading = false)
    },
  },
}