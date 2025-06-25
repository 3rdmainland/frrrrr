<template>
  <n-pop-up v-if="isActive" @click.native="isActive = false" v-click-outside>
    <span>{{$t('changeAddressPrompt.message', {locationType: basket.forDelivery ? $t('changeAddressPrompt.typeAddress') : $t('changeAddressPrompt.typeStore')})}}</span>
  </n-pop-up>
</template>

<script src="./menu-change-address-prompt.js"></script>