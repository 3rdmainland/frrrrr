<template>
  <n-page pattern-bg docked-footer :padding="false" class="order-setup-address-details">

    <n-ordering-order-setup-page-hero :title="$t('orderSetup.addressDetails.title')" :order-type="orderType" @update:orderType="$emit('update:orderType', $event)" :kerbside-only-collection="kerbsideOnlyCollection" :two-column-layout="twoColumnLayout" />

    <div class="chosen-address__wrapper">
      <n-container>
        <n-input readonly :value="address.formattedAddress" class="chosen-address">
          <n-button slot="append" :to="{name: 'order-setup-address', query: $route.query}" exact flat class="lumo-pink--text" v-track="{'order-setup:address-details': 'back'}">{{ $t('orderSetup.addressDetails.back') }}</n-button>
        </n-input>
      </n-container>
    </div>

    <div v-if="!twoColumnLayout" class="map-outlet__wrapper">
      <slot name="map-outlet" />
    </div>

    <n-container class="mt-5">
      <n-form @submit="$router.push(nextStep)">
        <n-input v-model="selectedAddress.name" name="name" :label="$t('orderSetup.addressDetails.name.label')" :placeholder="$t('orderSetup.addressDetails.name.placeholder')" optional />
        <n-input v-model="selectedAddress.building" name="building" :label="$t('orderSetup.addressDetails.building.label')" :placeholder="$t('orderSetup.addressDetails.building.placeholder')" optional autocomplete="shipping building" maxlength="32" />
        <n-input v-model="selectedAddress.instructions" name="instructions" :label="$t('orderSetup.addressDetails.instruction.label')" :placeholder="$t('orderSetup.addressDetails.instruction.placeholder')" optional maxlength="32" />
        <!-- A (hidden) submit button is required or else the form will not submit when the user presses enter -->
        <n-button class="hidden" type="submit">{{ $t('orderSetup.addressDetails.submit') }}</n-button>
      </n-form>

      <div class="flexbox">
        <n-spacer />
        <n-button error outline flat v-if="!isNewAddress" @click.native="deleteAddress" :loading="deleting">{{ $t('orderSetup.addressDetails.remove') }}</n-button>
      </div>

    </n-container>

    <n-page-footer slot="footer">
      <n-container>
        <n-button :to="nextStep" class="hero-cta" block  primary v-track="{'order-setup:address-details': 'next'}">
          <span class="nandos-hand">{{ $t('orderSetup.addressDetails.submit') }}</span>
        </n-button>
      </n-container>
    </n-page-footer>

  </n-page>
</template>

<script src="./order-setup-address-details.js"></script>