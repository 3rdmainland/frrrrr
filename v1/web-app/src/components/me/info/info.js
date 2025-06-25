import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import Customer from 'nandos-middleware-api/model/customer'
import { RouterUtils } from 'nandos-core-ui'
import GlobalConfigService from 'nandos-middleware-api/service/global-config-service'

export default {

  mixins: [RouterUtils],

  data () {
    return {
      ready: false,
      user: new Customer(),
      systemFlavours: null,
      server_error: null,
      loading: false,
      firstBirthYear: new Date().getFullYear() - 10,
      months: this.$t('common.months'),
      birth_day: null,
      birth_month: null,
      birth_year: null,
      LOYALTY_PROGRAM: process.env.VUE_APP_LOYALTY_PROGRAM,
    }
  },

  computed: {
    user_birthday() {
      let date = new Date(`${this.birth_year}-${parseInt(this.birth_month) + 1}-${this.birth_day}`)
      let isValidDate = date instanceof Date && isFinite(date)
      return isValidDate ? date : null
    }
  },

  created() {
    Promise.all([CustomerService.getMe(), GlobalConfigService.getAvailableFlavours()])
      .then(([user, systemFlavours]) => {
        this.user = user
        this.systemFlavours = systemFlavours

        if(this.user.birthday) {
          let parts = this.user.birthday.split('/')
          this.birth_day = this.$options.filters.padStart(parts[0])
          this.birth_month = this.$options.filters.padStart(parseInt(parts[1]) - 1)
          this.birth_year = parts[2]
        }
      })
      .then(() => this.ready = true)
  },

  watch: {
    user_birthday(newDate) {
      let isValidDate = newDate instanceof Date && isFinite(newDate)
      if(isValidDate) {
        let pad = (val) => this.$options.filters.padStart(val, '00')
        this.user.birthday = `${pad(newDate.getDate())}/${pad(newDate.getMonth() + 1)}/${newDate.getFullYear()}`
      }
    }
  },

  methods: {
    onSubmit(){
      this.loading = true;
      this.server_error = null;
      CustomerService.updateCustomer(this.user)
        .then(
          user => {
            this.user = user;
            this.$toaster.show( this.$t('profile.info.updated') );
            this.navigateUp();
          },
          error => this.server_error = error
        )
        .then(_ => this.loading = false);

    }
  }
}