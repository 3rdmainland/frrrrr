import { Toggleable } from 'nandos-core-ui'
import haversine from 'haversine'
import SilentGetUserLocation from '../../../utils/silent-get-user-location'

const MAX_DISTANCE_BEFORE_PROMPT = 10 //km
var _hasSeenPrompt = false

export default {

  // Can't use injects from a provider, as this component is used in <portals>
  props: {
    basketService: { type: Object, required: true },
    storeService: { type: Object, required: true },
  },

  mixins: [Toggleable],

  data() {
    return {
      basket: null,
      isBrowserApp: process.env.VUE_APP_CONTEXT == 'WEB',
    }
  },

  created() {
    if(_hasSeenPrompt) return

    this.basketService.getBasketSummary()
      .then(basket => {
        this.basket = basket
        if(!basket.isOrderSetup) throw new Error('Order not set up yet')
        return Promise.all([SilentGetUserLocation(), this.storeService.getStore(basket.storeId)])
      })
      .then(([userPosition, store]) => {
        let p1 = userPosition
        let p2 = { latitude: store.latitude, longitude: store.longitude}
        let distanceBetween = haversine(p1, p2)

        if(distanceBetween > MAX_DISTANCE_BEFORE_PROMPT) {
          this.isActive = true // show the pop up
        }
      })
      .catch(error => {}) // we don't need to handle the error, just don't display the prompt
      .finally(() => _hasSeenPrompt = true)
  },
}