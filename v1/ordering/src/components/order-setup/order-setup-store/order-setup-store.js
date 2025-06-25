import logger from 'nandos-dev-logger'
import Vue from 'vue'
import bowser from 'bowser'
import {FULFILLMENT_TYPES} from 'nandos-middleware-api/service/basket/basket-service'
import {STORE_CAPACITY_STATUS} from 'nandos-middleware-api/model/store'
import CustomerAddress from 'nandos-middleware-api/model/customer-address'
import {ORDER_TYPES} from 'nandos-middleware-api/model/food-basket'
import MapCountryRestrictions from 'nandos-ordering/src/utils/map-country-restrictions'

export default {

    props: {
        basketService: {type: Object, required: true},
        storeService: {type: Object, required: true},
        orderType: {type: String, required: true},
        address: {type: Object},
        orderSetupLoading: {type: Boolean, required: true},
        store: {type: Object},
        fulfillmentType: {type: String},
        orderTime: {type: Date},
        twoColumnLayout: {type: Boolean},
        addressSearchQuery: String,
        hasChosenAddress: {type: Boolean},
        kerbsideCollect: {type: Boolean},
        customerVehicle: {type: Object},
        kerbsideCollectionEnabled: {type: Boolean},
        kerbsideOnlyCollection: {type: Boolean},
        kerbsideOnlyCollectionMessage: {type: String},
        useGeolocationFeatures: {type: Boolean, required: true},
    },

    data() {
        return {
            //////////////
            selectedAddress: this.address,
            selectedTime: this.orderTime,
            firstAvailableTimeSlot: this.basketService.firstAvailableTimeSlot,
            lastAvailableTimeSlot: this.basketService.lastAvailableTimeSlot,
            timeSlotInterval: this.basketService.BASKET_TIME_SLOT_INTERVAL,
            dailyMinHours: this.basketService.DAILY_BASKET_HOUR_MIN,
            dailyMaxHours: this.basketService.DAILY_BASKET_HOUR_MAX,
            useNativeTimeInput: (bowser.ios || bowser.android) !== undefined,
            //////////////

            MapCountryRestrictions,

            selectedStore: this.store,
            selectedStoreOnCreate: null,
            selectedFulfillmentType: this.fulfillmentType,
            isValidTimeSelection: true,

            stores: [],
            loadingStores: false,
            showFilters: false,
            selectedFilter: null,

            fulfillmentTypes: [
                {value: FULFILLMENT_TYPES.ASAP, text: this.$t('orderSetup.store.fulfillmentTime.options.asap')},
                {value: FULFILLMENT_TYPES.FUTURE, text: this.$t('orderSetup.store.fulfillmentTime.options.later')},
            ],

            vehicleColors: Object.entries(this.$t('common.colors')).map(([key, val]) => ({value: key, name: val})),
            storeFacilityFilters: (process.env.VUE_APP_STORE_FILTERS || '').split(',').map(f => f.toLowerCase().trim()),
            displayableStoreFacilities: (process.env.VUE_APP_VISIBLE_STORE_FACILITIES || '').split(',').map(f => f.toLowerCase().trim()),
        }
    },

    computed: {

        forDelivery() {
            return this.orderType == ORDER_TYPES.DELIVERY
        },

        availableStoreFilters() {
            let filters = this.stores
                .map(store => store.facilities)
                .reduce((prev, curr) => prev.concat(curr), []) // flatten results
                .filter((item, index, arr) => index === arr.findIndex(t => t.type === item.type)) // dedupe
                .filter(item => this.storeFacilityFilters.includes(item.type)) // we only care about these types of filters
                .sort((a, b) => { // sort alphabetically
                    if (a.title < b.title) return -1
                    if (a.title > b.title) return 1
                    return 0
                })

            // Add the special "all" filter
            if (filters.length > 0)
                filters.unshift({title: this.$t('orderSetup.store.results.filters.clear'), type: null})

            return filters
        },

        noStoresFound() {
            return !this.loadingStores && this.displayStores.length == 0
        },

        displayStores() {

            return this.stores
                .filter(store => {
                    return this.forDelivery
                        ? store.deliveryCapable && store.capacity.canDeliverToLocation
                        : store.collectionCapable && (!this.kerbsideCollect || store.kerbsideCapable)
                })
                .filter(store => {
                    if (this.selectedFilter == null) return store
                    else return store.facilities.find(facility => facility.type == this.selectedFilter)
                })
                .sort((a, b) => {
                    if (this.selectedStoreOnCreate && a.id == this.selectedStoreOnCreate.id) return -1
                    if (this.canOrderFromStore(a) && !this.canOrderFromStore(b)) return -1
                    if (this.canOrderFromStore(b) && !this.canOrderFromStore(a)) return 1
                    return a.distance - b.distance
                })
        },

        // Returns true if 1 or more stores from displayStores support kerbside collection
        kerbsideCollectionAvailable() {
            return this.displayStores.find(store => store.kerbsideCapable) != null
        },

        orderSetupIsValid() {
            return this.selectedStore && this.isValidTimeSelection && this.hasChosenAddress
                && (this.forDelivery || !this.kerbsideCollect || (this.customerVehicle.registration && this.customerVehicle.make && this.customerVehicle.color))
        },

        orderTypeKey() {
            switch (this.orderType) {
                case ORDER_TYPES.DELIVERY:
                    return 'delivery'
                case ORDER_TYPES.COLLECTION:
                    return this.kerbsideCollect ? 'kerbside' : 'collection'
                case ORDER_TYPES.EAT_IN:
                    return 'eatIn'
            }
        },
    },

    watch: {
        store() {
            this.selectedStore = this.store
        },

        selectedStore() {
            this.$emit('update:store', this.selectedStore)
        },

        selectedFulfillmentType() {
            if (this.selectedFulfillmentType == FULFILLMENT_TYPES.ASAP) {
                this.selectedTime = null
            } else if (this.selectedFulfillmentType == FULFILLMENT_TYPES.FUTURE && this.useNativeTimeInput) {
                Vue.nextTick(() => this.$refs.timeInput && this.$refs.timeInput.$refs.nativeInput.focus())
            }

            this.$emit('update:fulfillmentType', this.selectedFulfillmentType)

            this.stores = []
            setTimeout(() => this.findStores(), 0)
        },

        selectedTime() {
            this.$emit('update:orderTime', this.selectedTime)
            setTimeout(() => this.findStores(), 0)
        },

        selectedAddress: {
            deep: true,
            handler() {
                this.$emit('update:address', this.selectedAddress)
                setTimeout(() => this.findStores(), 0)
            },
        },

        selectedFilter() {
            this.selectedStore = this.displayStores.find(store => this.canOrderFromStore(store))
        },

        // When kerbsideCollect changes, make sure we drop the selected store if no longer viable
        kerbsideCollect() {
            if (this.selectedStore && !this.canOrderFromStore(this.selectedStore)) this.selectedStore = null
        },
    },

    created() {
        // You should never be on this page without a selected address, unless it is a COLLECTION order
        if (this.orderType != ORDER_TYPES.COLLECTION && !this.hasChosenAddress) {
            if (this.orderType == null) {
                return this.$router.push({name: 'order-setup-start'})
            } else {
                return this.$router.push({name: 'order-setup-address'})
            }
        }


        this.basketService.getBasketSummary()
            .then(async basket => {


                let preferredStoreId = basket.storeId
                try {
                    if (this.$route.query.ps && !basket.storeId) {
                        const store = await this.preLoadStore(this.$route.query.ps)
                        if (store) {
                            if (this.orderType === ORDER_TYPES.COLLECTION) {
                                this.$nextTick(() => this.placeSelected({
                                    latitude: store.latitude,
                                    longitude: store.longitude,
                                    formattedAddress: store.address
                                }))
                            } else {
                                preferredStoreId = preferredStoreId ?? store.id
                            }
                        }
                    }
                } catch (e) { // todo - i know using await and normal promises is bad - so we need to change this code to use await/async going forward.

                }
                this.findStores(preferredStoreId)
            })
            .then(() => this.selectedStoreOnCreate = this.selectedStore) // allows us to sort the customer's previously selected store to the top of the list
    },

    methods: {

        placeSelected(address) {
            this.selectedAddress = new CustomerAddress(address)
        },

        preLoadStore(storeCode) {
            return this.storeService.getStoreForOrderTypeAndStoreCode(storeCode, this.orderType)
                .then((s) => {
                    if (s) {
                        return s
                    }
                    return null
                })
                .catch((e) => console.warn("preferred store not found"))
        },

        findStores(preferredStoreId) {

            if (!this.isValidTimeSelection || !this.hasChosenAddress) return

            this.stores = []
            this.selectedStore = null
            this.loadingStores = true

            let latitude = this.selectedAddress.latitude
            let longitude = this.selectedAddress.longitude
            let searchRadius = this.forDelivery ? 15 : 40
            let time = (this.selectedFulfillmentType == FULFILLMENT_TYPES.FUTURE && this.selectedTime) ? this.selectedTime.getTime() : undefined

            return this.storeService.locate(latitude, longitude, searchRadius, this.orderType, time)
                .then(result => this.stores = result.stores)
                .then(() => {
                    let firstAvailableStore = this.displayStores.find(store => this.canOrderFromStore(store))
                    if (preferredStoreId) {
                        let matchedStore = this.displayStores.find(store => store.id === preferredStoreId)
                        if (matchedStore && this.canOrderFromStore(matchedStore)) {
                            this.selectedStore = matchedStore
                        } else {
                            this.selectedStore = firstAvailableStore
                        }
                    } else {
                        this.selectedStore = firstAvailableStore
                    }

                    if (!this.kerbsideOnlyCollection && !this.kerbsideCollectionAvailable) this.$emit('update:kerbsideCollect', false)
                })
                .catch(logger.error)
                .finally(() => this.loadingStores = false)
        },

        canOrderFromStore(store) {
            if (store.callCenterDisabled) return false
            if (this.forDelivery) {
                return store.deliveryCapable && store.menuId != null && store.capacity.canDeliverToLocation && store.getStatus() === STORE_CAPACITY_STATUS.AVAILABLE
            } else {
                return store.collectionCapable && store.menuId != null && store.getStatus() === STORE_CAPACITY_STATUS.AVAILABLE && (!this.kerbsideCollect || store.kerbsideCapable)
            }
        },

        /**
         * Return a list facilities that we want to show icons for
         */
        getStoreFacilities(store) {
            return store.facilities.filter(facility => this.displayableStoreFacilities.includes(facility.type))
        },
    },
}