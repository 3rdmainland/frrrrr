<template>
  <n-page overlap-app-header pattern-bg class="offline">
    <section class="flexbox fill-height">

      <n-container class="my-auto">
        <div>
          <img class="broken-heart mb-4" src="~nandos-core-ui/src/assets/img/broken-heart.svg">
          <h2>{{ $t('offline.title') }}</h2>
        </div>
      </n-container>
    </section>

    <n-page-footer slot="footer">
      <n-container class="fill-height" :class="{'px-0': $breakpoints.xs}">
        <n-button @click.native="checkConnectionStatus" primary :block="$breakpoints.xs" class="full-page-footer-btn-xs" :loading="loading">{{ $t('offline.retry') }}</n-button>
      </n-container>
    </n-page-footer>
  </n-page>
</template>

<script src="./offline.js"></script>
<style src="./offline.scss" lang="scss"></style>