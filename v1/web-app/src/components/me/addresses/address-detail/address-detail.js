import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import CustomerAddress from 'nandos-middleware-api/model/customer-address'
import { RouterUtils } from 'nandos-core-ui'
import MapCountryRestrictions from 'nandos-ordering/src/utils/map-country-restrictions'

export default {

  mixins: [RouterUtils],

  props: ['address_id'],

  data () {
    return {
      address: new CustomerAddress(),
      address_chosen: false,
      loading: false,
      MapCountryRestrictions,
    }
  },

  computed: {
    is_new_address () {
      return this.address_id === undefined;
    },
  },

  created() {
    if(! this.is_new_address) {
      CustomerService.getAddress(this.address_id)
        .then(customerAddress => {
          this.address = customerAddress;
          this.address_chosen = true;
        })
    }
  },

  deactivated() {
    // Reset some things so when this view is re-used, it works right :)
    this.address_chosen = false;
    this.address = new CustomerAddress();
  },

  methods: {
    onSubmit: function() {
      if( this.address_chosen ) {
        this.loading = true;
        (this.is_new_address ? CustomerService.addAddress(this.address) : CustomerService.updateAddress(this.address))
          .then(() => this.navigateUp())
          .then(() => this.$toaster.show( this.$t(`profile.addresses.detail.${this.is_new_address ? 'created' : 'updated'}`) ))
          .then(() => this.loading = false);
      };
    },

    placeSelected: function(address) {
      this.address = new CustomerAddress(address);
      this.address_chosen = true;
    },

    deleteAddress: function() {
      CustomerService.deleteAddress(this.address.id)
        .then(() => this.navigateUp())
        .then(() => this.$toaster.show( this.$t('profile.addresses.detail.deleted') ))
    }
  }
}