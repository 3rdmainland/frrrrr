import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import ContactService from 'nandos-middleware-api/service/contact-service'

export default {

  data() {
    return {
      user: null,
      form_data: { name: '', lastName: '', mobilePhoneNumber: '', email: '', message: '' },
      loading: false,
      show_form: true,
      CALL_CENTER_PHONE: process.env.VUE_APP_CALL_CENTER_PHONE,
      CUSTOMER_CARE_EMAIL: process.env.VUE_APP_CUSTOMER_CARE_EMAIL,
    }
  },

  computed: {
    ready() {
      return this.user != null
    },
  },
  
  created() {
    CustomerService.getMe()
      .then(user => {
        this.user = user
        this.populateFormDataFromUser(user)
      })
  },

  methods: {
    populateFormDataFromUser(user) {
      for(var prop in user) {
        if(this.form_data[prop] !== undefined) {
          this.form_data[prop] = user[prop]
        }
      }
    },

    onSubmit(e) {
      this.loading = true;

      ContactService.talkToUs(this.form_data.name, this.form_data.lastName, this.form_data.mobilePhoneNumber, this.form_data.email, this.form_data.message)
        .then(result => {
          if(result) {
            this.show_form = false
          }
        })
        .then(() => this.loading = false);
    }
  }
}