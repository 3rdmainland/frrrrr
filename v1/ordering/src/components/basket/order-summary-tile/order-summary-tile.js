import OrderTypeKey from 'nandos-i18n/src/filters/order-type-key'

export default {

  props: {
    basket: { type: Object, required: true },
    editable: { type: Boolean },
  },

  computed: {
    orderTypeKey() {
      return OrderTypeKey(this.basket)
    },
  },

}