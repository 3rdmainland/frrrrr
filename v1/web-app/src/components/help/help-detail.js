import HelpService from 'nandos-middleware-api/service/help-service'
import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import StoreService from 'nandos-middleware-api/service/store-service'
import { RouterUtils } from 'nandos-core-ui'

export default {

  mixins: [RouterUtils],

  props: {
  	helpItemId: { type: String, required: true },
  	context: { type: String, required: true },
  	relatedEntity: { type: String },
  },

  data() {
    return {
      helpItem: null,
      templateData: null,
      userComment: null,
      canSubmit: true,
      loading: false,
    }
  },

  computed: {
    ready() {
      return this.helpItem != null
    },

    showFooter() {
      return this.ready && this.helpItem.contactFormEnabled && this.$breakpoints.smDown
    }
  },
  
  created() {
    let promiseQueue = [ HelpService.getHelpItem(this.context, this.helpItemId), CustomerService.getMe() ]

    if(this.context == 'food' && this.relatedEntity) {
      let p = new Promise((resolve, reject) => {
        let _order, _store
        CustomerService.getFoodOrder(this.relatedEntity)
          .then(order => _order = order)
          .then(() => StoreService.getStore(_order.storeId))
          .then(store => _store = store)
          .then(() => resolve({order: _order, store: _store}))
      })
      promiseQueue.push(p)
    }
    else if(this.context == 'gift-card' && this.relatedEntity) {
      let p = CustomerService.getGiftCardOrder(this.relatedEntity)
        .then(order => ({order}))
      promiseQueue.push(p)
    }

    Promise.all(promiseQueue)
      .then(([helpItem, customer, ...rest]) => {
        this.helpItem = helpItem
        this.templateData = Object.assign({customer}, ...rest)
      })
      .catch(error => this.navigateUp())
      
  },

  methods: {
    onFormValid(isValid) {
      this.canSubmit = isValid
    },

    onSubmit() {
      this.loading = true
      HelpService.submitQuery(this.userComment, this.helpItemId, this.relatedEntity, this.context)
        .then(() => {
          this.$toaster.show( this.$t('help.queryForm.submitted'), {parent: this} )
          this.navigateUp()
        })
        .catch(() => this.$toaster.show( this.$t('help.queryForm.submittedError'), {parent: this, error: true} ))
        .finally(() => this.loading = false)
    },
  },
}