export default {

  props: {
    customerService: { type: Object, required: true },
    orderType: { type: String, required: true },
    address: { type: Object, required: true },
    twoColumnLayout: { type: Boolean },
    kerbsideOnlyCollection: { type: Boolean },
    isNewAddress: { type: Boolean },
  },

  data() {
    return {
      selectedAddress: this.address,
      deleting: false,
      nextStep: {name: 'order-setup-final', query: this.$route.query},
      previousStep: {name: 'order-setup-address', query: this.$route.query},
    }
  },

  watch: {
    selectedAddress() {
      this.$emit('update:address', this.selectedAddress)
    },
  },

  methods: {
    deleteAddress() {
      this.deleting = true
      this.customerService.deleteAddress(this.address.id)
        .then(() => {
          this.$emit('address-deleted', this.address)
          this.$router.push(this.previousStep)
          this.$toaster.show( this.$t('orderSetup.addressDetails.removed') )
        })
        .finally(() => this.deleting = false)
    }
  },
}