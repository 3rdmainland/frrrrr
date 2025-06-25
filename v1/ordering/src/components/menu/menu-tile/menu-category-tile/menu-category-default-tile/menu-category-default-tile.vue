<template>
  <n-tile :to="renderChildren ? null : categoryRoute" column :class="classes" :style="`background-color: ${useAccentColor && data.accentColor};`">

    <!-- Header image -->
    <n-tile-content :class="{[placeholder]: true, 'menu-tile__category_header--only': !renderChildren}" class="menu-tile__item-image">
      <n-computed-image :image-collection="data.imageCollection" />
    </n-tile-content>

    <!-- Title + description -->
    <n-tile-content class="menu-tile__item-details">
      <n-blocked-heading tag="h3"><span v-html="data.name"></span></n-blocked-heading>
      <p v-if="data.description">
        <span class="triangle-decorator lumo-pink mb-2"></span>
        <span v-html="data.description"></span>
      </p>
    </n-tile-content>

    <!-- Children( Sub-categories, products, promotions) -->
    <n-tile-content v-if="renderChildren" class="menu-tile__category-item-listing text-xs-left pa-0">
      <n-list>
        <n-ordering-category-list-item v-for="child in data.children" :data="child" v-bind="$attrs" :key="child.id" />
      </n-list>
    </n-tile-content>

    <n-edit-menu-entity-link v-if="preview" :item="data"/>
  </n-tile>
</template>

<script src="menu-category-default-tile.js"></script>