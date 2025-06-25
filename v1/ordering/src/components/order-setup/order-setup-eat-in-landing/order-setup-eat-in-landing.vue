<template>
  <n-page pattern-bg :padding="false" class="order-setup-eat-in-landing">

    <n-ordering-order-setup-page-hero :title="$t('orderSetup.eatIn.title')" order-type="EAT_IN" @update:orderType="$emit('update:orderType', $event)" @step="$emit('update:step', $event)" :two-column-layout="twoColumnLayout" :for-delivery="false" />

    <n-container>
      <section class="flexbox fill-height column">

        <!-- QR Code Scan -->
        <n-tile class="scan-prompt mb-6">
          <n-tile-content>
            <n-button @click.native.stop="showScanner = !showScanner" primary floating :disabled="!hasCamera" class="scan-prompt__btn">
              <n-icon>photo_camera</n-icon>
              <span class="scan-prompt__btn__info-text">{{ $t('orderSetup.eatIn.qrCodeScan.scan') }}</span>
            </n-button>
            <p v-html="$t('orderSetup.eatIn.qrCodeScan.description')"></p>
            <template v-if="!hasCamera">
              <br>
              <span class="error--text">{{ $t('orderSetup.eatIn.qrCodeScan.noCamera') }}</span>
            </template>
          </n-tile-content>
        </n-tile>

        <n-spacer />

        <!-- Show short code input -->
        <section v-if="!showShortCodeForm" class="text-xs-center mb-4">
          <p style="margin-bottom: 0.4em;">{{ $t('orderSetup.eatIn.shortCodeForm.title') }}</p>
          <i18n tag="p" path="orderSetup.eatIn.shortCodeForm.description">
            <n-button slot="action" @click.native="showShortCodeForm = !showShortCodeForm" text-link class="underline">{{ $t('orderSetup.eatIn.shortCodeForm.actionLabel') }}</n-button>
          </i18n>
        </section>
        
        <transition name="fade-transition">
          <!-- Short code form -->
          <n-form v-if="showShortCodeForm" @submit="onShortCodeSubmit" class="text-xs-left" autocomplete="off">
            <n-input v-model="shortCode" ref="shortCodeInput" :label="$t('orderSetup.eatIn.shortCodeForm.label')" :placeholder="$t('orderSetup.eatIn.shortCodeForm.placeholder')" minlength="3" required />
            <n-button type="submit" ref="shortCodeFormSubmitBtn" secondary block with-triangle>{{ $t('orderSetup.eatIn.shortCodeForm.submit') }}</n-button>
          </n-form>
        </transition>
      </section>

    </n-container>

    <n-dialog slot="floating-content" v-model="showScanner" fullscreen overlap-app-header>
      <n-page :class="{'yellow sunshine pattern-bg pattern-bg--flowery pattern-bg--scale-up': isBrowserApp}" overlap-app-header :padding="false" :style="`background-color: ${!isBrowserApp ? 'transparent' : ''};`">
        <n-qr-code-scanner v-if="showScanner" :is-browser-app="isBrowserApp" @result="onScanResult" @error="onScanError" />
      </n-page>
      <n-button slot="closeBtn" inverted icon absolute top right large>
        <n-icon>close</n-icon>
      </n-button>
    </n-dialog>

  </n-page>
</template>

<script src="order-setup-eat-in-landing.js"></script>