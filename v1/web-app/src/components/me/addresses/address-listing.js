import CustomerService from 'nandos-middleware-api/service/customer/me-service'

export default {

  data () {
    return {
      addresses: null,
    }
  },

  created() {
    CustomerService.getAddresses()
      .then(addresses => this.addresses = addresses)
  }
}