<template>
  <n-page pattern-bg docked-footer :show-footer="hasCreatedNewAddress" :padding="false" class="order-setup-address" :class="{'has-chosen-address': hasChosenAddress, 'has-created-new-address': hasCreatedNewAddress}">

    <n-ordering-order-setup-page-hero :title="$t('orderSetup.address.title')" :order-type="orderType" @update:orderType="$emit('update:orderType', $event)" :kerbside-only-collection="kerbsideOnlyCollection" :two-column-layout="twoColumnLayout" />

    <n-container>

      <!-- Google places input -->
      <section class="google-places-input-wrapper">
        <n-google-places-input
         :value="addressSearchQuery"
         @input="$emit('update:addressSearchQuery', $event)"
         ref="google-places-input"
         @place-selected="placeSelected"
         :geolocation="useGeolocationFeatures"
         :country-restriction="MapCountryRestrictions"
         :label="$t('orderSetup.address.newAddress.label')"
         :placeholder="$t('orderSetup.address.newAddress.placeholder')"
         :geolocation-hint="$t('addressSearch.geolocation')"
         :result-not-selected-error="$t('addressSearch.errors.resultNotSelected')"
         :non-street-address-error="$t('addressSearch.errors.nonStreetAddress')">
          <n-pop-up v-if="!hasChosenAddress || !isNewAddress" slot="geolocation-btn" left top>
            <small>{{$t('addressSearch.geolocation')}}</small>
          </n-pop-up>
        </n-google-places-input>
        <p v-if="!showMap" class="mb-4 grey--text text--darken-1">{{ $t('orderSetup.address.newAddress.hint') }}</p>
      </section>

      <!-- Saved address listing -->
      <section v-if="showSavedAddresses">
        <n-list class="mb-6">
          <n-list-item v-for="address in savedAddresses" :key="address.id">
            <n-list-tile @click.native="useSavedAddress(address)" :highlight="address == selectedAddress">
              <n-list-tile-content>
                <n-list-tile-title>{{address.name}}</n-list-tile-title>
                <n-list-tile-sub-title>{{address.formattedAddress}}</n-list-tile-sub-title>
              </n-list-tile-content>
              <n-list-tile-action narrow>
                <n-button icon flat small @click.native.stop="selectedAddress = address; $router.push(editAddressDetailsStep)">
                  <n-icon>edit</n-icon>
                </n-button>
              </n-list-tile-action>
            </n-list-tile>
            <n-list-divider/>
          </n-list-item>
        </n-list>
      </section>

      <section v-if="!showSavedAddresses && anonymous">
        <n-container class="text-xs-center align-center justify-center py-2">
          <section>
            <p class="mb-1">{{ $t('signUp.address.prompt') }}</p>
            <n-button :to="{ name: 'sign-in', query: $route.query}" secondary round small style="font-size: 0.9em;"  v-track="{'sign up form': 'go to log in form'}">{{ $t('signUp.signIn') }}</n-button>
          </section>
        </n-container>
      </section>

    </n-container>

    <!-- Map is passed in via slot from parent -->
    <transition appear name="slide-y-reverse-transition">
      <div v-if="showMap" class="map-outlet__wrapper">
        <slot name="map-outlet" />
      </div>
    </transition>

    <!-- Confirm new address footer button (not used for saved address) -->
    <n-page-footer slot="footer">
      <n-container>
        <n-button :to="editAddressDetailsStep" class="hero-cta" block  primary v-track="{'order-setup:address': 'next'}">
          <span class="nandos-hand">{{ $t('orderSetup.address.submit') }}</span>
        </n-button>
      </n-container>
    </n-page-footer>

  </n-page>
</template>

<script src="order-setup-address.js"></script>