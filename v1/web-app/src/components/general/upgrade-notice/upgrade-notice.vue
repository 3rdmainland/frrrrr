<template>
  <n-page overlap-app-header pattern-bg class="upgrade-notice">
    <n-container v-if="ready" class="flex-center fill-height align-center">
      <div class="text-xs-center">
        <img class="chicken" src="~nandos-core-ui/src/assets/img/barci.svg">
        <h2>{{ $t('upgrade.title') }}</h2>
        <p>
          {{ $t('upgrade.description') }}<br>
          <span v-if="$isCordovaApp">{{ $t('upgrade.instructions.mobile.title') }}</span>
          <i18n v-else tag="span" path="upgrade.instructions.web.title">
            <n-button slot="action" @click.native="reload" primary text-link>{{ $t('upgrade.instructions.web.action') }}</n-button>
          </i18n>
        </p>

        <n-button v-if="$isCordovaApp" primary external :to="appStoreURL">{{ $t('upgrade.instructions.mobile.action') }}</n-button>
      </div>
    </n-container>
  </n-page>
</template>

<script src="upgrade-notice.js"></script>
