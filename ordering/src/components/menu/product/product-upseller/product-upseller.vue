<template>
  <component :is="computedTransition">
    <div v-if="ready && isActive" class="product-upseller grey darken-4 pattern-bg pattern-bg--default elevation-5 pt-2" v-click-outside>

      <div class="upsell__heading flexbox align-center justify-space-between py-2" :class="{'container': $breakpoints.mdUp}">
        <p class="white--text pr-3" v-html="$t('productUpseller.title', {product: product.getShortName()})"></p>
        <n-button @click.native="isActive = false" icon small flat inverted class="mt-0">
          <n-icon>close</n-icon>
        </n-button>
      </div>

      <div class="mb-3" :class="{'container': $breakpoints.mdUp}">        
        <n-carousel :per-page="upsellsPerPage" :peek="$breakpoints.smDown" :with-breadcrumbs="false" :with-control-btns="$breakpoints.mdUp" :rtl="languageService.rtl">
          <n-ordering-menu-tile v-for="upsell in upsells" @click.native="isActive = false" :data="upsell.item" :redirect="$route.fullPath" :show-children="false" :row="upsells.length == 1" hide-description :key="upsell.item.id" />
        </n-carousel>
      </div>
    </div>
  </component>
</template>

<script>export {default} from './product-upseller.js';</script>