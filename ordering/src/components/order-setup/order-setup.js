import { FULFILLMENT_TYPES } from 'nandos-middleware-api/service/basket/basket-service'
import { ORDER_TYPES } from 'nandos-middleware-api/model/food-basket'
import CustomerAddress from 'nandos-middleware-api/model/customer-address'
import { ViewStateService } from 'nandos-core-ui'
import { getPlaceFromCoOrds, convertPlaceToAddress } from 'nandos-core-ui/src/utils/google-maps-helpers'
import { USER_MARKER, CHILLI_MARKER } from 'nandos-core-ui/src/components/maps/map.js'
import SilentGetUserLocation from '../../utils/silent-get-user-location'
import haversine from 'haversine'

export default {

  props: {
    globalConfigService: { type: Object, required: true },
    basketService: { type: Object, required: true },
    customerService: { type: Object, required: true },
    mapCenterDefault: { type: Object /*{latitude, longitude}*/, required: true },
    useGeolocationFeatures: { type: Boolean, default: true },
  },

  data () {
    return {
      ready: false,
      view_state: ViewStateService,
      
      basket: null,
      orderTypes: ORDER_TYPES,
      savedAddresses: null,
      orderSetupLoading: false,

      orderType: null,
      address: null,
      store: null,
      orderTime: null,
      fulfillmentType: null,
      kerbsideCollect: false,
      customerVehicle: {
        registration: null,
        make: null,
        color: null,
      },
      addressSearchQuery: '',

      showHelp: false,
      googleMap: null,
      pageTransition: '',
    }
  },

  computed: {

    currentStep() {
      return this.$route.name
    },

    currentStepIsStart() {
      return this.currentStep == 'order-setup-start'
    },

    pageTitle() {
      if(this.currentStepIsStart)
        return this.$t('orderSetup.titleShort')
      else
        switch(this.orderType) { // TODO:: Use orderTypeKey from i18n package (MUST pass a basket to orderTypeKey filter)
          case ORDER_TYPES.DELIVERY: return this.$t('orderType.delivery')
          case ORDER_TYPES.COLLECTION: return this.$t('orderType.collection')
          case ORDER_TYPES.EAT_IN: return this.$t('orderType.eatIn')
        }
    },

    twoColumnLayout() {
      return this.$breakpoints.mdUp && !this.currentStepIsStart
    },

    overlapAppHeader() {
      return this.$breakpoints.smDown
    },

    isNewAddress () {
      return this.address && this.address.id == null
    },

    hasChosenAddress () {
      return this.address && this.address.latitude != this.mapCenterDefault.latitude && this.address.longitude != this.mapCenterDefault.longitude
    },

    userMapMarker () {
      return { clickable:this.mapInteractive, draggable:this.mapInteractive, icon: USER_MARKER, position: { lat: this.address.latitude, lng: this.address.longitude }}
    },

    storeMarker () {
      return {icon: CHILLI_MARKER, position: { lat: this.store.latitude, lng: this.store.longitude}, store: this.store}
    },

    mapMarkers () {
      let markers = []
      switch(this.orderType) {
        case ORDER_TYPES.DELIVERY:
          if(this.hasChosenAddress) markers.push(this.userMapMarker)
            break;
        case ORDER_TYPES.COLLECTION:
          if(this.hasChosenAddress) {
            markers.push(this.userMapMarker)
            if(this.store) markers.push(this.storeMarker)
          }
            break;
        case ORDER_TYPES.EAT_IN:
          if(this.store) markers.push(this.storeMarker)
            break;
      }
      return markers
    },

    mapInteractive() {
      return (this.currentStep == 'order-setup-address' && this.isNewAddress)
    },

    mapZoomLevel () {
      return this.hasChosenAddress ? 16 : 9
    },

    minimumDeliveryAmount () {
      return this.configs.minimumDeliveryAmount
    },

    eatInEnabled () {
      return this.configs.eatInEnabled
    },

    kerbsideCollectionEnabled () {
      return this.configs.kerbsideEnabled
    },

    kerbsideOnlyCollection () {
      return this.configs.kerbsideOnlyCollection == true
    },

    kerbsideOnlyCollectionMessage () {
      return this.configs.kerbsideOnlyCollectionMessage
    },
  },

  watch: {
    orderType(newVal, oldVal) {
      this.address = null
      this.addressSearchQuery = ''
      this.restoreAddressFromBasket()

      // When switching to delivery, warn about the delivery menu's price difference
      if(process.env.VUE_APP_WARN_ABOUT_DELIVERY_PRICING && oldVal != null && newVal == ORDER_TYPES.DELIVERY) {
        this.$toaster.show(null, {
          parent: this,
          timeout: 5000,
          template:
            `<i18n path="orderSetup.switchToDeliveryPriceWarning.message">
              <n-button slot="moreInfo" jump to="/content/delivery-pricing-info" text-link secondary v-track="{'delivery-pricing-notice-toast': 'more info'}">{{ $t('orderSetup.switchToDeliveryPriceWarning.moreInfo') }}</n-button>
            </i18n>`
          }
        )
      }
    },

    '$route'() {
      switch(this.view_state.lastNavigationDirection) {
        case 'jump-up':
        case 'jump-down':
        case 'down': this.pageTransition = 'page-slide-right-to-left'; break;
        case 'up': this.pageTransition = 'page-slide-left-to-right'; break;
      }

    },

    currentStep: 'validateCurrentStep',

    store() {
      if(this.googleMap) {
        setTimeout(() => {
          // For collection, center map around selected store marker and user's search location marker
          if(this.orderType == ORDER_TYPES.COLLECTION && this.store && this.hasChosenAddress) {
            var polyBounds = new google.maps.LatLngBounds()
            polyBounds.extend({ lat: this.store.latitude, lng: this.store.longitude })
            polyBounds.extend(this.userMapMarker.position)
            this.googleMap.fitBounds( polyBounds )
          }
          if(this.orderType == ORDER_TYPES.EAT_IN && this.store) {
            this.googleMap.panTo({ lat: this.store.latitude, lng: this.store.longitude })
          }
        }, 0)
      }
    },
  },

  created() {
    Promise.all([this.getSavedAddresses(), this.basketService.getBasketSummary(), this.globalConfigService.getConfigs()])
      .then(([addresses, basket, configs]) => {
        this.basket = basket
        this.configs = configs

        // If the user has already set up an order on their basket, restore those values
        this.orderType = basket.orderType

        // todo if the route has passed in params about the order type - deal with that here:
        if(this.$route.query && this.$route.query.ot){
          this.orderType = this.$route.query.ot.toString().toUpperCase()
        }

        this.fulfillmentType = basket.fulfillmentType || FULFILLMENT_TYPES.ASAP
        this.orderTime = this.fulfillmentType == FULFILLMENT_TYPES.FUTURE && basket.orderTime && new Date(basket.orderTime) || null
        this.restoreAddressFromBasket()

        // If we are dealing with a future order and the selected time is in the past, switch to ASAP
        if(this.fulfillmentType == FULFILLMENT_TYPES.FUTURE) {
          // If date on the basket is in the past (or not far enough on the future), ignore it, and revert to ASAP ordering
          if(this.orderTime.getTime() < this.basketService.firstAvailableTimeSlot.getTime()) {
            this.fulfillmentType = FULFILLMENT_TYPES.ASAP
            this.orderTime = null
          }
        }



        // Check if it should be forced to true or restore user selection
        this.kerbsideCollect = this.kerbsideOnlyCollection || basket.kerbsideCollect
        if(basket.customerVehicle) this.customerVehicle = basket.customerVehicle
        
        this.validateCurrentStep()

        this.$nextTick(() => this.ready = true)
      })
  },

  methods: {

    onMapReady(mapInstance) {
      this.googleMap = mapInstance
    },

    getSavedAddresses() {
      return this.customerService.getAddresses()
        .then(addresses => {

          // Try and sort addresses by proximity to user's current location
          return (this.useGeolocationFeatures ? SilentGetUserLocation({timeout: 2500}) : Promise.reject())
            .then(userPosition => {
              const distanceLookup = {}

              return this.savedAddresses = addresses.sort((a,b) => {
                let aDist = distanceLookup[a.id] || (distanceLookup[a.id] = haversine(userPosition, { latitude: a.latitude, longitude: a.longitude}))
                let bDist = distanceLookup[b.id] || (distanceLookup[b.id] = haversine(userPosition, { latitude: b.latitude, longitude: b.longitude}))
                return aDist - bDist
              })
            })
            .catch(error => this.savedAddresses = addresses) // unable to get user location, just use the unsorted address
        })
    },

    onAddressDeleted(deletedAddress) {
      this.savedAddresses = this.savedAddresses.filter(address => address.id != deletedAddress.id)
      this.restoreAddressFromBasket()
    },

    restoreAddressFromBasket() {
      if(this.orderType == ORDER_TYPES.DELIVERY) {
        // If the user has already set up an address on their basket, use that address
        let addressOnBasket = this.savedAddresses.find(address => address.id == this.basket.customerAddressId)
        if(addressOnBasket || (this.savedAddresses && this.savedAddresses.length > 0))
          this.address = addressOnBasket || this.savedAddresses[0]
      }
      else if(this.orderType == ORDER_TYPES.COLLECTION) {
        // If the user has already searched for stores near an address, use those search terms to build up an address
        if(this.basket.collectionSearchAddress && this.basket.collectionSearchCoordinates) {
          let coOrds = this.basket.collectionSearchCoordinates.split(',')
          this.address = new CustomerAddress({
            formattedAddress: this.basket.collectionSearchAddress,
            latitude: parseFloat(coOrds[0]),
            longitude: parseFloat(coOrds[1]),
          })
          this.addressSearchQuery = this.basket.collectionSearchAddress
        }
      }
      else if(this.orderType == ORDER_TYPES.EAT_IN) {
        // No restore
      }

      if(this.address == null) {
        this.address = new CustomerAddress(this.mapCenterDefault)
      }
    },

    setAddressFromPosition(position) {
      let lat = position.lat()
      let lng = position.lng()

      // Update the selected address' lat/lng to match map's new center position
      this.address.latitude = lat
      this.address.longitude = lng

      // Update the selected address' textual info, like street, formattedAddress etc (if available)
      this.augmentAddressDataFromPosition(lat, lng)
    },

    augmentAddressDataFromPosition(lat, lng) {
      getPlaceFromCoOrds(lat, lng/*, {country: this.country}*/) // the country restriction seems to cause issues somehow
        .then(place => convertPlaceToAddress(place))
        .then(address => {
          this.addressSearchQuery = address.formattedAddress

          // Apply new address values to selected address
          Object.entries(address)
            .filter(([key, value]) => value != null && key != 'latitude' && key != 'longitude') // don't update lat/lng properties
            .forEach(([key, value]) => this.address[key] = value)
        })
    },

    validateCurrentStep() {
      if(this.currentStep == 'order-setup-address' || this.currentStep == 'order-setup-address-details' || this.currentStep == 'order-setup-final') {
        if(
          // You can't proceed until we know your order type
          (this.orderType == null) ||
          // Eat in order flow should not be on any of the above steps
          (this.orderType == ORDER_TYPES.EAT_IN) ||
          // You can't choose a store until you've selected an address
          (this.orderType == ORDER_TYPES.DELIVERY && !this.hasChosenAddress && this.currentStep != 'order-setup-address') ||
          // We don't use address steps for collection orders
          (this.orderType == ORDER_TYPES.COLLECTION && (this.currentStep == 'order-setup-address' || this.currentStep == 'order-setup-address-details'))
        ) {
          this.$router.push({name: 'order-setup-start', query: this.$route.query})
        }
      }
    },
    
    onFinish() {
      this.configureOrder()
    },

    configureOrder() {
      this.orderSetupLoading = true
      let orderTime = this.fulfillmentType == FULFILLMENT_TYPES.ASAP
        ? undefined
        : this.orderTime.getTime()

      let collectionSearchAddress, collectionSearchCoordinates, customerVehicle
      
      if(this.orderType == ORDER_TYPES.COLLECTION) {
        collectionSearchAddress = this.address.formattedAddress
        collectionSearchCoordinates = this.address.latitude + ',' + this.address.longitude
        customerVehicle = this.kerbsideCollect ? this.customerVehicle : null
      }

      let config = {
        orderType: this.orderType,
        storeId: this.store.id,
        address: this.address,
        fulfillmentType: this.fulfillmentType,
        orderTime,
        collectionSearchAddress,
        collectionSearchCoordinates,
        kerbsideCollect: this.kerbsideCollect,
        customerVehicle,
      }
      console.log('configureOrder', config)

      return this.basketService.configureOrder(config)
        .then(() => this.$router.push(this.$route.query.redirect || {name: 'menu'}))
        .finally(() => this.orderSetupLoading = false)
    },
  }
}