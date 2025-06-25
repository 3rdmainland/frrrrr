<template>
  <n-tile column 
   @click.stop="promotion.youtubeId ? playVideo() : null"
   :to="(promotion.link && !promotion.linkText) ? promotion.link : null"
   :target="promotion.linkIsExternal ? '_blank' : null"
   :class="classes"
   :style="`background-color: ${data.accentColor};`"
  >

    <!-- Image -->
    <n-tile-content :class="{[this.placeholder]: true}" class="menu-tile__item-image">
      <n-computed-image :image-collection="data.imageCollection" />
      <n-button v-if="promotion.youtubeId" icon large class="video-play-btn">
        <n-icon small>arrow_right</n-icon>
      </n-button>
    </n-tile-content>

    <!-- Title, description and CTA button -->
    <n-tile-content class="menu-tile__item-details">
      <n-blocked-heading tag="h3"><span v-html="data.name"></span></n-blocked-heading>
      <p v-if="data.description">
        <span class="triangle-decorator lumo-pink mb-2"></span>
        <span v-html="data.description"></span>
      </p>
      <n-button v-if="promotion.link && promotion.linkText" :to="promotion.link" :target="promotion.linkIsExternal ? '_blank' : null" small>{{promotion.linkText}}</n-button>
    </n-tile-content>

    <youtube v-if="promotion.youtubeId" :video-id="promotion.youtubeId" :player-vars="{rel: 0}" class="new-layer menu-tile--promo-tile__video" ref="youtubePlayer" />

    <n-edit-menu-entity-link v-if="preview" :item="data"/>

  </n-tile>
</template>

<script src="./menu-promo-tile.js"></script>

<style lang="scss">

.menu-tile--promo-tile {

  .menu-tile--promo-tile__video {
    display: none;
    width: 100%;
    height: 100%;
    pointer-events: all;
    z-index: 0;
  }

  &--video-is-playing {
    pointer-events: none;
    .menu-tile--promo-tile__video { display: block; }
  }

  .video-play-btn { font-size: 2em; }

}
</style>