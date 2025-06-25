<template>
  <n-page overlap-app-header :show-footer="showFooter" class="app-promotion-landing" :padding="false">
    <n-ordering-menu-tile v-if="category" :data="category" class="fill-height" />
    <n-page-footer slot="footer">
      <n-button :to="{name: 'menu'}" primary block class="fill-height ma-0">{{$t('appLanding.goToMenu')}}</n-button>
    </n-page-footer>
  </n-page>
</template>

<script src="app-promotion-landing.js"></script>

<style lang="scss">
	.app-promotion-landing .carousel__slide,
	.app-promotion-landing .tile { border-radius: 0 !important; }
</style>