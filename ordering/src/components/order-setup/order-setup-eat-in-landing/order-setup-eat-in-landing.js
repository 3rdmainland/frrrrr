import { ORDER_TYPES } from 'nandos-middleware-api/model/food-basket'
import { hasCamera } from 'nandos-core-ui/src/components/qr-code-scanner/qr-code-scanner.vue'

export default {

  props: {
    twoColumnLayout: Boolean,
  },

  data() {
    return {
      hasCamera: false,
      showScanner: false,
      showShortCodeForm: false,
      shortCode: null,
      isBrowserApp: process.env.VUE_APP_CONTEXT == 'WEB',
    }
  },

  watch: {
    showShortCodeForm() {
      if(this.showShortCodeForm == true) {
        this.$nextTick(() => {
          this.$refs.shortCodeInput.focus()
          this.$refs.shortCodeFormSubmitBtn.$el.scrollIntoView({block: 'end'})
        })
      }
    }
  },

  created() {
    (this.isBrowserApp ? hasCamera() : Promise.resolve(true)) // for cordova app, assume camera is available
      .then(result => this.hasCamera = result)
      .finally(() => {
        if(this.hasCamera == false) {
          this.showShortCodeForm = true
        }
      })

    this.$emit('update:orderType', ORDER_TYPES.EAT_IN)
    this.$emit('update:store', null)
  },

  methods: {
    onShortCodeSubmit() {
      this.$router.push({name: 'table-scan', params: {shortCode: this.shortCode}, query: this.$route.query})
    },

    onScanResult(result) {
      this.showScanner = false

      try {
        let url = new URL(result)
        let path = url.pathname.replace(process.env.VUE_APP_ROUTER_BASE_PATH, '')
        let matchedRoute = this.$router.match(path)

        if((url.host.includes('nandos') || process.env.NODE_ENV != 'production') && matchedRoute.name == 'table-scan') {
          this.$router.push({path, query: this.$route.query})
        }
        else {
          throw new Error('Does not match expected URL')
        }
      }
      catch(e) {
        let error = new Error()
        error.type = 'UNEXPECTED_QR_CODE_RESULT'
        this.onScanError(error)
      }      
    },

    onScanError(error) {
      let message = ''
      switch(error.type) {
        case 'UNEXPECTED_QR_CODE_RESULT':
          message = this.$t('orderSetup.eatIn.qrCodeScan.errors.UNEXPECTED_QR_CODE_RESULT')
          break;
        default:
          message = this.$t('orderSetup.eatIn.qrCodeScan.errors.default')
      }

      this.$toaster.show(message, {error: true, parent: this})
    },
  },
}