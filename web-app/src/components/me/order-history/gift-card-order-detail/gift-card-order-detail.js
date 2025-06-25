import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import GiftCardBasketService from 'nandos-middleware-api/service/gift-card-basket-service'
import headerImageCollection from '@/components/gift-cards/gift-card-header-image-collection'

export default {

  props: ['order_id'],

  data () {
    return {
      headerImageCollection,
      order: null,
      show_invoice_form: false,
      form_data: { email: '' },
      send_invoice_loading: false,
    }
  },

  computed: {
    ready() {
      return this.order != null
    },
  },

  created() {
    CustomerService.getGiftCardOrder(this.order_id)
      .then(order => this.order = order)

    CustomerService.getMe()
      .then(customer => this.form_data.email = customer.email)
  },

  methods: {
    getInvoice() {
      this.send_invoice_loading = true
      CustomerService.getGiftCardOrderInvoice(this.order.id, this.form_data.email)
        .then(() => {
          this.$toaster.show( this.$t('profile.history.invoice.sent'), {parent: this})
          this.show_invoice_form = false
          this.send_invoice_loading = false
        })
    },
  }
}