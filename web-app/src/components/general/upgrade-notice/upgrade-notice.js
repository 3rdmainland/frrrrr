import BasketService from 'nandos-middleware-api/service/basket/my-basket-service'

export default {

  data () {
    return {
      ready: false,
    }
  },

  computed: {
    appStoreURL() {
      if (this.$isCordovaApp) {
        switch (process.env.VUE_APP_CONTEXT) {
          case 'IOS': return `itms-apps://itunes.apple.com/app/${process.env.VUE_APP_IOS_APP_STORE_ID}`
          case 'ANDROID': return `market://details?id=${process.env.VUE_APP_ANDROID_APP_STORE_ID}`
          case 'HUAWEI_ANDROID': return `https://appgallery.huawei.com/#/app/${process.env.VUE_APP_HUAWEI_APP_STORE_ID}`
        }
      }
    },
  },

  created() {
    BasketService.getBasket()
      .then(res => this.$router.push(this.$route.query.redirect || '/')) // if we get a successful response, we have a supported version of app 
      .catch(e => this.ready = true)
  },

  methods: {
    reload() {
      window.location.reload(true) 
    }
  }
}