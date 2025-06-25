<template>
  <section class="gift-card-creator__card-design">

    <p class="text-xs-center visible-xs visible-sm">{{ $t('giftCard.creation.steps.design.subtitle') }}</p>

    <!-- Card Design -->
    <!-- Carousel for small devices -->
    <div v-if="$breakpoints.xs" class="mb-5" style="margin-left: -1rem; margin-right: -1rem;">      
      <n-carousel ref="carousel" peek :with-breadcrumbs="false" @page-changed="onCarouselPageChanged" :rtl="languageService.rtl" class="mb-3">
        <n-image v-for="preset in presets.designs" :src="preset.image.path" :class="{'selected': preset == selected_design }" :key="preset.image.path" fill center crossorigin="anonymous" class="card-design-image" />
      </n-carousel>
    </div>
    <!-- Image grid for larger devices -->
    <section v-else class="image-grid mb-5">
      <div v-for="preset in presets.designs" :key="preset.image.path" @click="selected_design = preset;" class="image-grid__cell" :class="{'selected': preset == selected_design }" v-track="{'gift-card-creator': 'design: preset selected'}">
        <n-image :src="preset.image.path" fill center crossorigin="anonymous" class="card-design-image"/>
        <div v-if="preset == selected_design" class="new-layer flexbox align-center justify-center">
          <n-icon large class="white--text">check</n-icon>
        </div>
      </div>
    </section>

    <div class="form-group">
      <n-button @click.native="$emit('next-step')" primary block with-triangle :disabled="!selectionIsValid" v-track="{'gift-card-creator': 'design: next'}">{{ $t('giftCard.creation.steps.design.form.confirm') }}</n-button>
    </div>
  </section>
</template>

<script src="./card-design.js"></script>