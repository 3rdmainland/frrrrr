<template>
  <n-page class="order-setup" :overlap-app-header="overlapAppHeader">

    <portal to="app-header-portal">
      <n-app-header :title="pageTitle" :transparent="overlapAppHeader && !currentStepIsStart" :class="{'white--text': overlapAppHeader && !currentStepIsStart}" />
    </portal>

    <n-dual-pane narrow-left>

      <n-page slot="left">
        <transition :name="pageTransition">
          <router-view
          v-if="ready"
          :key="$route.path"
          :class="{'mt-6': overlapAppHeader && currentStepIsStart}"
          :customerService="customerService"
          :basket="basket"
          :map-center-default="mapCenterDefault"
          :use-geolocation-features="useGeolocationFeatures"
          :two-column-layout="twoColumnLayout"
          :minimum-delivery-amount="minimumDeliveryAmount"
          :order-setup-loading="orderSetupLoading"
          :saved-addresses="savedAddresses"
          :has-chosen-address="hasChosenAddress"
          :is-new-address="isNewAddress"
          :eat-in-enabled="eatInEnabled"
          :kerbside-collection-enabled="kerbsideCollectionEnabled"
          :kerbside-only-collection="kerbsideOnlyCollection"
          :kerbside-only-collection-message="kerbsideOnlyCollectionMessage"
          :show-help.sync="showHelp"
          :address-search-query.sync="addressSearchQuery"
          :order-type.sync="orderType"
          :address.sync="address"
          :store.sync="store"
          :kerbside-collect.sync="kerbsideCollect"
          :customer-vehicle.sync="customerVehicle"
          :fulfillmentType.sync="fulfillmentType"
          :order-time.sync="orderTime"
          @address-deleted="onAddressDeleted"
          @restore-address-from-basket="restoreAddressFromBasket"
          @available-stores="availableStores = $event"
          @set-address-from-position="setAddressFromPosition($event.position)"
          @finish="onFinish">
            <n-map
             v-if="ready"
             ref="map"
             slot="map-outlet"
             class="grey lighten-3"
             :latitude="address.latitude"
             :longitude="address.longitude"
             :zoom="mapZoomLevel"
             :markers="mapMarkers"
             :draggable="mapInteractive"
             :zoom-control="mapInteractive"
             gesture-handling="greedy"
             @ready="onMapReady"
             @drag-start="showHelp = false;"
             @marker-dragstart="showHelp = false;"
             @marker-dragend="setAddressFromPosition($event.position)" />
          </router-view>
        </transition>
       <portal-target v-if="!twoColumnLayout" name="help-content" slot="floating-content" />
       
      </n-page>

      <n-page slot="right" :padding="false" v-if="twoColumnLayout">
        <n-map
         v-if="ready"
         ref="map"
         class="grey lighten-3"
         :latitude="address.latitude"
         :longitude="address.longitude"
         :zoom="mapZoomLevel"
         :markers="mapMarkers"
         :draggable="mapInteractive"
         :zoom-control="mapInteractive"
         gesture-handling="greedy"
         @ready="onMapReady"
         @drag-start="showHelp = false;"
         @marker-dragstart="showHelp = false;"
         @marker-dragend="setAddressFromPosition($event.position)" />
         <portal-target name="help-content" slot="floating-content" />
      </n-page>

    </n-dual-pane>

    <!-- Helper text pop-up -->
    <portal to="help-content">
      <section v-if="showHelp" class="new-layer" style="pointer-events: none;" :style="`height: calc(50% + ${twoColumnLayout ? '5px' : '55px'})`">
        <n-pop-up class="column pa-4 align-start">
          <p class="grey--text text--lighten-1">{{ $t('orderSetup.address.map.hint.title') }}</p>
          <p>{{ $t('orderSetup.address.map.hint.message') }}</p>
        </n-pop-up>
      </section>
    </portal>
  </n-page>
</template>

<script src="./order-setup.js"></script>