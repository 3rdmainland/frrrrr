import CustomerAddress from 'nandos-middleware-api/model/customer-address'
import { getPlaceFromCoOrds, convertPlaceToAddress } from 'nandos-core-ui/src/utils/google-maps-helpers'
import MapCountryRestrictions from 'nandos-ordering/src/utils/map-country-restrictions'

export default {

  props: {
    orderType: { type: String, required: true },
    savedAddresses: { type: Array, required: true },
    basket: { type: Object, required: true },
    address: { type: Object },
    hasChosenAddress: { type: Boolean },
    isNewAddress: { type: Boolean },
    addressSearchQuery: String,
    twoColumnLayout: Boolean,
    kerbsideOnlyCollection: { type: Boolean },
    mapCenterDefault: { type: Object /*{latitude, longitude}*/, required: true },
    useGeolocationFeatures: { type: Boolean, required: true },
  },

  data() {
    return {
      hasSearchedWithGooglePlacesInput: false,
      nextStep: {name: 'order-setup-final', query: this.$route.query},
      editAddressDetailsStep: {name: 'order-setup-address-details', query: this.$route.query},
      selectedAddress: this.address,
      newAddress: null,
      MapCountryRestrictions,
      anonymous:false,
    }
  },

  computed: {
    hasSavedAddresses () {
      return this.savedAddresses && this.savedAddresses.length > 0
    },

    hasCreatedNewAddress () {
      return this.hasChosenAddress && this.isNewAddress
    },

    showSavedAddresses () {
      return !this.isNewAddress && this.hasSavedAddresses
    },

    showMap () {
      return !this.twoColumnLayout && this.hasChosenAddress && !this.showSavedAddresses
    },
  },

  watch: {
    selectedAddress() {
      this.$emit('update:address', this.selectedAddress)
    },

    address: {
      deep: true,
      handler() {
        if(this.$refs['google-places-input']) this.$refs['google-places-input'].error = null
      },
    },

    showSavedAddresses() {
      this.$emit('update:showHelp', false)
    }
  },

  mounted() {
    this.$emit('restore-address-from-basket')
    if(process.env.VUE_APP_CONTEXT !== 'ADMIN'){
      require("nandos-middleware-api/service/customer/me-service")
          .default
          .isAnonymous()
          .then((isAnonymous)=>this.anonymous = isAnonymous)
    }
  },

  methods: {

    useSavedAddress(address) {
      this.selectedAddress = address
      this.$router.push(this.nextStep)
    },

    resetNewAddress() {
      this.newAddress = new CustomerAddress(this.mapCenterDefault)
    },

    placeSelected(address) {
      /*if(address.recommedViewport) {
        this.$emit('set-map-bounds', address.recommedViewport)
      }*/

      // Show help only if this is the first address resolved for the user
      if(this.hasSearchedWithGooglePlacesInput == false) {
        this.hasSearchedWithGooglePlacesInput = true
        setTimeout(() => this.$emit('update:showHelp', true), 100);
      }
      
      this.selectedAddress = new CustomerAddress(address)
    },
  },

  beforeDestroy() {
    this.$emit('update:showHelp', false)
  }
}