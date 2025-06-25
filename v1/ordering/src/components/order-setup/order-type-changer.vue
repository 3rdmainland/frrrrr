<template>
  <n-select v-model="selected" class="order-type-chager-select" label="Order type">
    <option v-for="type in types" :value="type">{{ $t(`orderType.${$options.filters.camelCase(type)}`) }}</option>
  </n-select>
</template>

<script>
import { ORDER_TYPES } from 'nandos-middleware-api/model/food-basket'

export default {

  props: {
    orderType: { type: String, required: true },
  },

  data() {
    return {
      types: [ORDER_TYPES.DELIVERY, ORDER_TYPES.COLLECTION, ORDER_TYPES.EAT_IN],
      selected: this.orderType,
    }
  },

  watch: {
    orderType() {
      this.selected = this.orderType
    },

    selected() {
      this.$emit('update:orderType', this.selected)
    },
  },
}

</script>

<style lang="scss">
  .order-type-chager-select {
    width: 100%;
    text-align-last: center;
    background-color: rgba(255, 255, 255, 0.25);

    select { color: inherit !important; }
  }
</style>