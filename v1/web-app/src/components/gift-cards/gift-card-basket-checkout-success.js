import CustomerService from 'nandos-middleware-api/service/customer/me-service'

export default {

  props: {
    orderId: { type: String, required: true }
  },

  data () {
    return {
      order: null,
      CALL_CENTER_PHONE: process.env.VUE_APP_CALL_CENTER_PHONE,
    }
  },

  created() {
    CustomerService.getGiftCardOrder(this.orderId)
      .then(order => this.order = order)
  },
}