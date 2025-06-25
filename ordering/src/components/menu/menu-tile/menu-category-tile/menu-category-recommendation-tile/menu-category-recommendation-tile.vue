<template>
  <n-tile column :class="classes" :style="`background-color: ${data.accentColor};`">

    <!-- Title + description -->
    <n-tile-content class="menu-tile__item-details">
      <n-blocked-heading tag="h3"><span v-html="data.name"></span></n-blocked-heading>
      <p v-if="data.description">
        <span class="triangle-decorator lumo-pink mb-2"></span>
        <span v-html="data.description"></span>
      </p>
    </n-tile-content>

    <!-- Children( Sub-categories, products, promotions) -->
    <n-tile-content class="menu-tile__category-item-listing text-xs-left pa-0">
      <n-list>
        <n-ordering-category-list-item v-for="(child, idx) in data.children.slice(0, numItemsToDisplay)" :data="child" v-bind="$attrs" :key="child.id" />
      </n-list>
    </n-tile-content>

    <n-tile-content v-if="hasAdditionalItems" class="mb-3 pa-0">
      <n-button :to="{name: 'menu-suggestions'}" class="ma-0"  v-track="{'menu-recommendation-tile': 'more suggestions'}">{{ $t('menu.recommendedCategory.more') }}</n-button>
    </n-tile-content>

    <n-edit-menu-entity-link v-if="preview" :item="data"/>
  </n-tile>
</template>

<script src="./menu-category-recommendation-tile.js"></script>