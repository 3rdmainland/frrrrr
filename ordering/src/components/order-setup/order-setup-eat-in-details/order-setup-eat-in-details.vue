<template>
  <n-page pattern-bg docked-footer :show-footer="ready" :padding="false" class="order-setup-eat-in-details">
    
    <n-ordering-order-setup-page-hero :title="$t('orderSetup.eatInDetails.title')" order-type="EAT_IN" @update:orderType="$emit('update:orderType', $event)" @step="$emit('update:step', $event)" :two-column-layout="twoColumnLayout" :for-delivery="false" />

    <n-container v-if="ready">
      <!-- Unable to resolve store/table from QR code scan/shortCode -->
      <n-alert v-if="error" error :value="true">
        <i18n tag="div" path="orderSetup.eatInDetails.errors.invalidTableCode">          
          <n-button slot="tryAnotherCode":to="{name: 'order-setup-eat-in-landing', query: $route.query}" exact text-link secondary>{{ $t('orderSetup.eatInDetails.errors.tryAnotherCode')}}</n-button>
        </i18n>
      </n-alert>
      
      <!-- Store can't accept eat in order -->
      <n-alert v-else-if="!canOrderFromStore" error :value="true">
        <div>
          {{ $t('orderSetup.eatInDetails.errors.storeUnavailable', {store: store.name}) }}
        </div>
      </n-alert>

      <!-- Succesfully resolved store and it can accept EAT_IN order-->
      <template v-else>
        <div class="text-xs-center">
          <h3 class="display-5 tilted mb-4">{{ $t('orderSetup.eatInDetails.subtitle') }}</h3>
        </div>
        <n-tile>
          <n-tile-content>
            <span>{{ $t('orderSetup.eatInDetails.result.table') }}</span>
            <h3 style="font-size: 6em;" class="my-1">{{tableId}}</h3>
            <span>{{ $t('orderSetup.eatInDetails.result.store', {store: store.name}) }}</span>
          </n-tile-content>
        </n-tile>
      </template>

    </n-container>

    <n-page-footer slot="footer" v-if="ready">
      <n-container>
        <n-button class="hero-cta" @click.native.stop="configureOrder" :disabled="!orderSetupIsValid" :loading="saving"  block  primary v-track="{'eat-in-order-setup': 'finish'}">
          <span class="nandos-hand">{{ $t('orderSetup.eatInDetails.submit') }}</span>
        </n-button>
      </n-container>
    </n-page-footer>

  </n-page>
</template>

<script src="./order-setup-eat-in-details.js"></script>