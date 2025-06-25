import BasketService from 'nandos-middleware-api/service/basket/my-basket-service'

export default {

  data () {
    return {
      loading: false
    }
  },

  methods: {
    checkConnectionStatus() {
      this.loading = true

      BasketService.getBasket()
        .then(res => this.$router.push(this.$route.query.redirect || '/'))
        .catch(e => this.$toaster.show( this.$t('offline.errors.offline'), {parent:this} ))
        .finally(() => this.loading = false)
    }
  }
}