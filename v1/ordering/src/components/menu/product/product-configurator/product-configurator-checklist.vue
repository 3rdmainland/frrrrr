<script>
export default {
  name: "product-configurator-checklist",
  props: {
    userProduct: {required: true},
    showValidationErrors: Boolean,
    halfAndHalfMode: Boolean
  },
  computed: {
    shouldKeepOpen() {
      return this.userProduct.canMultiSelect()
    },
    relatedProducts() {
      return this.userProduct.isFlavourContainer() ? this.userProduct.getDisplayRelatedProducts().filter(r => this.halfAndHalfMode === r.isHalfAndHalfContainer()) : this.userProduct.getDisplayRelatedProducts()
    }

  },
  methods: {
    handleClick(selected) {
      this.$forceUpdate()
      this.$emit('click', {selected, forceStayOnScreen: this.shouldKeepOpen});
    },
  },
  mounted() {
    console.log('configure checklist for: ', this.userProduct.getName(),this.userProduct)
  }
}
</script>

<template>
  <n-list dense style="width: 100%">
    <n-list-subheader v-if="userProduct.getDisplayRelatedProducts()[0].isLeaf()">{{
        userProduct.getName()
      }}
    </n-list-subheader>
    <n-list-item v-for="relatedProduct in  relatedProducts"
                 :key="relatedProduct.getIdPath() + '-' + relatedProduct.getName()">
      <template v-if="!relatedProduct.isLeaf() && !userProduct.isSideConatiner() && !userProduct.getDisplayRelatedProducts()[0].hasSubTrees()">
        <product-configurator-checklist ref="sublist" :user-product="relatedProduct"
                                        @click="({selected})=>{ handleClick(selected);}"/>
      </template>
      <n-list-tile :disabled="!relatedProduct.isAvailable()" @click.stop="handleClick(relatedProduct)" v-else>
        <n-list-tile-action narrow>
          <n-icon key="tick" v-if="relatedProduct.isSelected() && relatedProduct.isValidState()"
                  class="success--text">check_circle
          </n-icon>
          <n-icon key="unselected" v-else>outline_circle</n-icon>
        </n-list-tile-action>
        <n-list-tile-content style="font-size: 0.9em;">
          <n-list-tile-title v-html="relatedProduct.getShortName()"/>
        </n-list-tile-content>
        <n-list-tile-action class="item-chips" style="" no-stack>
          <template v-if="relatedProduct.isAvailable()">
            <span v-if="relatedProduct.computePrice()" class="money">{{
                $t('product.configuration.hasAdditionalCost', {amount: $options.filters.money(relatedProduct.computePrice())})
              }}</span>
            <n-chip v-else-if="!relatedProduct.isValidState()" :class="showValidationErrors ? 'error' : 'black'">
              {{ $t('product.configuration.required') }}
            </n-chip>
            <n-icon v-if="!relatedProduct.isLeaf() " flip-for-rtl tiny class="ml-2">arrow_right</n-icon>
          </template>
          <template v-else>
            <n-chip v-for="exclusion in relatedProduct.getExclusions()" :key="exclusion">
              {{ $t(`product.exclusions.${exclusion}`) }}
            </n-chip>
          </template>
          <span></span>
        </n-list-tile-action>
      </n-list-tile>
    </n-list-item>
  </n-list>
</template>

<style scoped lang="scss">

</style>