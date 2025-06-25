<template>
  <n-page :padding="false" class="embedded-content-page">
    <portal to="app-header-portal">
      <n-app-header :title="pageTitle" :force-hamburger="forceHamburger" />
    </portal>

    <n-template-string v-if="ready" v-once :content="snippet" :data="templateData" :wrap-content="false" />

    <n-dialog slot="floating-content" v-model="showQrScanner" fullscreen overlap-app-header>
      <n-page :class="{'yellow sunshine pattern-bg pattern-bg--flowery pattern-bg--scale-up': isBrowserApp}" overlap-app-header :padding="false" :style="`background-color: ${!isBrowserApp ? 'transparent' : ''};`">
        <n-qr-code-scanner v-if="showQrScanner" :is-browser-app="isBrowserApp" @result="onQrScanResult" @error="onQrScanError" />
      </n-page>
      <n-button slot="closeBtn" class="white black--text" inverted icon absolute top right large>
        <n-icon>close</n-icon>
      </n-button>
    </n-dialog>

  </n-page>
</template>

<script>
  import AuthService from 'nandos-middleware-api/service/auth-service'
  import Http from 'nandos-middleware-api/http'
  import CustomerService from 'nandos-middleware-api/service/customer/me-service'
  import SnippetService from 'nandos-middleware-api/service/snippet-service'
  import { hasCamera } from 'nandos-core-ui/src/components/qr-code-scanner/qr-code-scanner.vue'
  import Tracker from 'nandos-tracking'

  const IS_PRODUCTION = process.env.NODE_ENV == 'production'
  const EXPECTED_IFRAME_ORIGIN = process.env.VUE_APP_WEBSITE_URL

  export default {

    props: {
      snippetId: { type: String, required: true },
    },

    data() {
      return {
        isBrowserApp: process.env.VUE_APP_CONTEXT == 'WEB',
        showQrScanner: false,
        iframe: null,
        pageTitle: null,
        user: null,
        snippet: null,
        forceHamburger: true,
      }
    },

    computed: {
      ready() {
        return this.user != null && this.snippet != null
      },

      templateData() {
        return {user: this.user}
      },
    },

    mounted() {

      Promise.all([CustomerService.getMe(), SnippetService.getSnippet(this.snippetId)])
        .then(([user, snippet]) => {
          this.user = user
          this.snippet = snippet

          this.$nextTick(() => {
            window.addEventListener('message', this.onPostMessage)
            this.iframe = this.$el.querySelector('iframe')
          })

        })
        .catch(e => {
          this.$toaster.show(this.$t('genericContentPage.contentMissing'), {parent: this, error: true})
        })
    },

    methods: {
      sendMessage(type, data) {
        if(this.iframe == null) return;
        this.iframe.contentWindow.postMessage({type, data}, IS_PRODUCTION ? EXPECTED_IFRAME_ORIGIN : '*')
      },

      onPostMessage(event) {
        if(event.origin === EXPECTED_IFRAME_ORIGIN || !IS_PRODUCTION) {
          
          if(!event.data) return;

          switch(event.data.cmd) {
            case 'navigateTo': this.$router.push(event.data.route); break;
            case 'jumpNavigateTo': this.$router.push(`${event.data.route}?jump=true&redirect=${this.$route.fullPath}`); break;
            case 'setPageTitle': this.pageTitle = event.data.title; break;
            case 'toast': this.$toaster.show(event.data.message, event.data.options); break;
            case 'track': Tracker.track(event.data.event, event.data.data); break;
            case 'startQrCodeScan': this.showQrScanner = true; break;
            case 'setForceHamburger': this.forceHamburger = event.data.forceHamburger; break;

            case 'getAuthTokenForDevice': this.generateAuthTokenForDevice(event.data.userAgent); break;
            case 'fetch': this.doFetch(event.data.config); break;
            case 'getUserData': this.sendMessage('USER_DATA', this.user); break;
            case 'getUrl': this.sendMessage('PARENT_URL', window.location.href); break;
            case 'getPath': this.sendMessage('PARENT_PATH', this.$route.fullPath); break;
            case 'getUrlSearchParams': this.sendMessage('PARENT_URL_SEARCH_PARAMS', Object.fromEntries( new URLSearchParams(window.location.search) )); break;
            case 'checkHasCamera': this.checkHasCamera(); break;
          }
        }
      },

      generateAuthTokenForDevice(userAgent) {
        AuthService.generateAuthTokenForDevice(userAgent)
          .then(credentials => this.sendMessage('AUTH_TOKEN_RESULT', {credentials}))
          .catch(error => this.sendMessage('AUTH_TOKEN_ERROR', {error}))
      },

      doFetch(config) {
        const method = config.method || 'get';
        (method == 'get' ? Http.get(config.url) : Http.request(config))
          .then(response => this.sendMessage('FETCH_RESULT', {response: response.data, config}))
          .catch(error => this.sendMessage('FETCH_ERROR', {error, config}))
      },

      checkHasCamera() {
        (this.isBrowserApp ? hasCamera() : Promise.resolve(true)) // for cordova app, assume camera is available
          .then(result => this.sendMessage('HAS_CAMERA', result))
      },

      onQrScanResult(result) {
        this.showQrScanner = false
        this.sendMessage('QR_SCAN_RESULT', result)
      },

      onQrScanError(error) {
        this.showQrScanner = false
        this.sendMessage('QR_SCAN_ERROR', error)
      },
    },

    beforeDestroy() {
      window.removeEventListener('message', this.onPostMessage)
      this.iframe = null
    }
  }
</script>

<style lang="scss">
  .embedded-content-page {
    iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: none;
    }
  }
</style>