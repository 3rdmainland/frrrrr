<template>
  <n-tile @click="onClick" column class="menu-tile menu-tile--product-tile--expansive-layout menu-tile--auto-combo-tile yellow pattern-bg pattern-bg--triangles-black-5">

    <!-- Product Image -->
    <n-tile-content class="menu-tile__item-image pa-0" :class="placeholder">
      <small v-if="autoComboItem.userProduct.getBadge()" class="product__badge" style="width: 100%;" :style="`background-color: ${autoComboItem.userProduct.getBadge().backgroundColor}; color: ${autoComboItem.userProduct.getBadge().textColor};`">
        {{autoComboItem.userProduct.getBadge().title}}
      </small>
      <div class="product-image-container">
        <n-computed-image :image-collection="autoComboItem.userProduct.getImageCollection()" />
      </div>
    </n-tile-content>

    <n-tile-content class="menu-tile__item-details auto-combo-tile__details">
      <n-blocked-heading tag="h3"><span v-html="autoComboItem.userProduct.getName()"></span></n-blocked-heading>
      <div class="flexbox row justify-space-between align-start" style="width: 100%;">
        
        <p class="text-xs-left mr-3 mb-0">
          <small><strong>{{ $t('product.autoCombo.combine') }}</strong></small><br>
          <span v-html="autoComboItem.replacedBasketItems.map(item => item.productName).join(', ')"></span>
        </p>
        <strong class="text-xs-right">        
          <i18n tag="small" path="product.autoCombo.savings">
            <div slot="amount" class="money money--large" style="font-weight: normal;">{{autoComboItem.savings | money}}</div>
          </i18n>
        </strong>
        <slot></slot>
      </div>
    </n-tile-content>


  </n-tile>
</template>

<script src="./auto-combo-tile.js"></script>
