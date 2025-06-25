<script>
export default {
  name: "free-product-selector",
  props: {
    freeProducts: {type: Array, default: []},
    value: { required: true },
  }

}
</script>

<template>
  <n-tile c column>
    <n-tile-content class="black white--text">
      <!-- TODO: I18n -->
      <h4 class="display-1">Pick your FREE product</h4>
    </n-tile-content>
    <n-tile-content>
      <n-list class="pt-3">
        <n-list-item v-for="freeProduct in freeProducts"
                     @click.stop="$emit('select',freeProduct)"
                     :key="freeProduct.value">
          <n-list-tile selectable>
            <n-list-tile-action>
              <n-icon key="tick" v-if="freeProduct.value === value"
                      class="success--text">check_circle
              </n-icon>
              <n-icon key="unselected" v-else>outline_circle</n-icon>
            </n-list-tile-action>
            <n-list-tile-content style="font-size: 0.9em;">
              <n-list-tile-title v-html="freeProduct.label"/>
            </n-list-tile-content>
          </n-list-tile>
        </n-list-item>
      </n-list>
    </n-tile-content>
  </n-tile>
</template>

<style scoped lang="scss">

</style>