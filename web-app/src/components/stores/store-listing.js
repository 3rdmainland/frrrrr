import StoreService from 'nandos-middleware-api/service/store-service'
import Store from 'nandos-middleware-api/model/store'
import CustomerAddress from 'nandos-middleware-api/model/customer-address'
import MapCountryRestrictions from 'nandos-ordering/src/utils/map-country-restrictions'

export default {

  data() {
    return {
      loading: false,
      query: '',
      selected_address: null,
      stores: [],
      store_type_filter: null,
      show_filters: false,
      show_map: false,
      storeFacilityFilters: (process.env.VUE_APP_STORE_FILTERS || '').split(',').map(f => f.toLowerCase().trim()),
      MapCountryRestrictions,
    }
  },

  computed: {
    no_stores_found() {
      return this.selected_address && !this.loading && this.stores.length == 0 
    },

    display_stores() {
      return this.stores
        .filter(store => { // only return stores whose facilities match the store_type_filter
          if(this.store_type_filter == null) return store
          else return store.facilities.find(facility => facility.type == this.store_type_filter)
        })
        .sort((a ,b) => a.distance - b.distance) // sort stores by distance from the selected address
    },

    available_store_filters () {
      let filters = this.stores
        .map(store => store.facilities)
        .reduce((prev, curr) => prev.concat(curr), []) // flatten results
        .filter((item, index, arr) => index === arr.findIndex(t => t.type === item.type)) // dedupe
        .filter(item => this.storeFacilityFilters.includes(item.type)) // we only care about these types of filters
        .sort((a,b) => { // sort alphabetically
          if(a.title < b.title) return -1
          if(a.title > b.title) return 1
          return 0
        })

      // Add the special "all" filter
      if(filters.length > 0)
        filters.unshift({ title: this.$t('orderSetup.store.results.filters.clear'), type: null})

      return filters
    },

    map_markers () {
      return this.display_stores
        .map(store => ({
          data: store,
          position: { lat: store.latitude, lng: store.longitude },
        }))
        .concat([ // add an icon for the user's search location
          {
            clickable: false,
            icon: { path: 0, scale: 5 },
            position: { lat: this.selected_address.latitude, lng: this.selected_address.longitude },
          }
        ])
    },
  },

  watch: {
    selected_address() {
      this.stores = []
      this.findStores()
    }
  },

  methods: {
    placeSelected(address) {
      this.selected_address = new CustomerAddress(address)
    },

    findStores() {
      this.loading = true
      let latitude = this.selected_address.latitude
      let longitude = this.selected_address.longitude
      let search_radius = 40
      StoreService.locate(latitude, longitude, search_radius)
        .then(result => this.stores = result.stores)
        .then(() => this.loading = false)
    },
  }
}