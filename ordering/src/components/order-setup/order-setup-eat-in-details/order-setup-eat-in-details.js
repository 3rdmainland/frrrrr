import Store, { STORE_CAPACITY_STATUS } from 'nandos-middleware-api/model/store'
import { ORDER_TYPES } from 'nandos-middleware-api/model/food-basket'

export default {

  props: {
    basketService: { type: Object, required: true },
    storeService: { type: Object, required: true },
    customerService: { type: Object, required: true },
    shortCode: { type: String, required: true },
    twoColumnLayout: Boolean,
  },

  data() {
    return {
      ready: false,
      store: null,
      tableId: null,
      customer: null,
      error: null,
      saving: false,
    }
  },

  computed: {
    canOrderFromStore() {
      return this.store != null && this.store.eatInCapable && this.store.menuId != null && this.store.getStatus() === STORE_CAPACITY_STATUS.AVAILABLE
    },

    orderSetupIsValid() {
      return this.canOrderFromStore && this.tableId != null
    },

    customerIsSignedIn() {
      return this.customer && !this.customer.anonymous
    },
  },

  created() {
    this.$emit('update:orderType', ORDER_TYPES.EAT_IN)

    Promise.all([this.resolveStoreShortCode(), this.customerService.getMe()])
      .then(([_, customer]) => this.customer = customer)
      .finally(() => this.ready = true)
  },

  methods: {
    resolveStoreShortCode() {
      return this.storeService.resolveStoreShortCode(this.shortCode)
        .then(({store, tableId}) => {
          this.store = store
          this.tableId = tableId

          this.$emit('update:store', this.store)
        })
        .catch(error => this.error = error)
    },

    configureOrder() {
      this.saving = true
      this.basketService.configureEatInOrder(this.store.id, this.tableId)
        .then(() => this.$router.push(this.$route.query.redirect || {name: 'menu'}))
        .finally(() => this.saving = false)
    },
  },
}