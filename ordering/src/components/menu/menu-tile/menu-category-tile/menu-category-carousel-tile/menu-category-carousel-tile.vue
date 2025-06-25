<template>
  <n-tile :style="`background-color: ${data.accentColor};`" :class="classes">
    <n-carousel v-if="data" with-control-btns overlay-control-btns overlay-breadcrumbs :auto-advance-time="6" @page-changed="onCarouselPageChanged">
      <n-ordering-menu-tile v-for="child in data.children" :data="child" v-bind="$attrs" :key="child.id" expansive-layout :show-children="false" :row="false" @video-is-playing="onSlideVideoIsPlaying" />
    </n-carousel>

    <n-edit-menu-entity-link v-if="preview" :item="data"/>

  </n-tile>
</template>

<script src="./menu-category-carousel-tile.js"></script>