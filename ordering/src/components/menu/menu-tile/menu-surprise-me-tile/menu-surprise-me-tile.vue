<template>
  <n-tile :class="classes">

    <!-- Header image -->
    <n-tile-content xs5 :class="{[placeholder]: true}" class="pa-0" style="height: 10em; min-height: 100%;">
      <n-carousel v-if="supriseMeCarouselProducts.length" :with-breadcrumbs="false" :auto-advance-time="2">
        <template v-for="(surpriseItem, supriseIdx) in supriseMeCarouselProducts">
          <!-- Question mark graphic -->
          <img class="new-layer" style="object-fit: cover;" src="../../../../assets/img/surpise-me.png" :key="`surprise-me-graphic-${supriseIdx}`">
          <!-- Surprise product image teaser -->
          <n-computed-image :image-collection="surpriseItem.getImageCollection()" :key="`surprise-me-${surpriseItem.getIdPath()}`" />
        </template>
      </n-carousel>
    </n-tile-content>

    <n-tile-content xs7 class="align-start justify-space-between text-xs-left black white--text column">
      <h5 class="display-2">{{ $t('menu.surpriseMe.description') }}</h5>
      <n-button @click="surpriseMe" small round inverted class="ma-0" :class="{'px-3': $breakpoints.xs}" style="align-self: flex-end;" v-track="{'surprise-me': 'show random product'}">{{ $t('menu.surpriseMe.cta') }}</n-button>
    </n-tile-content>

  </n-tile>
</template>

<script src="./menu-surprise-me-tile.js"></script>