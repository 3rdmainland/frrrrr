<template>
  <n-page pattern-bg docked-footer :padding="false" class="order-setup-store">

    <n-ordering-order-setup-page-hero :title="$t('orderSetup.store.title')" :order-type="orderType"
                                      @update:orderType="$emit('update:orderType', $event)"
                                      :kerbside-only-collection="kerbsideOnlyCollection"
                                      :two-column-layout="twoColumnLayout"/>

    <div v-if="forDelivery" class="chosen-address__wrapper">
      <n-container>
        <n-input readonly truncate :value="address.formattedAddress" class="chosen-address">
          <n-button slot="append" :to="{name: 'order-setup-address', query: $route.query}" exact flat
                    class="lumo-pink--text" v-track="{'order-setup:store': 'back'}">{{ $t('orderSetup.store.back') }}
          </n-button>
        </n-input>
      </n-container>
    </div>

    <div v-if="forDelivery && !twoColumnLayout" class="map-outlet__wrapper">
      <slot name="map-outlet"/>
    </div>

    <n-container class="ios-safari-rendering-fix mt-5">

      <n-form @validity="isValidTimeSelection = $event">

        <!-- Fulfilment type selection - ASAP or Later -->
        <div class="form-group">
          <label class="mb-3">{{ $t('orderSetup.store.fulfillmentTime.label') }}</label>

          <n-list>
            <n-list-item v-for="fulfillmentOption in fulfillmentTypes" :key="fulfillmentOption.value">
              <n-list-tile selectable>
                <n-list-tile-content>
                  <n-radio v-model="selectedFulfillmentType" :radio-value="fulfillmentOption.value"
                           :label="fulfillmentOption.text" name="fulfillmentOption" collapse-empty-content/>
                </n-list-tile-content>
              </n-list-tile>
              <n-list-divider/>
            </n-list-item>
          </n-list>
        </div>

        <!-- Time selection (if Later was selected) -->
        <n-time-picker v-if="selectedFulfillmentType == 'FUTURE'"
                       day-time-mode
                       v-model="selectedTime"
                       :dailyMinHours="dailyMinHours"
                       :dailyMaxHours="dailyMaxHours"
                       :minTime="firstAvailableTimeSlot"
                       :maxTime="lastAvailableTimeSlot"
                       :minuteIncrements="timeSlotInterval"
                       :use-native-time-input="useNativeTimeInput"
                       :hour-label="$t('orderSetup.store.fulfillmentTime.timeSelection.hour.label')"
                       :hour-placeholder="$t('orderSetup.store.fulfillmentTime.timeSelection.hour.placeholder')"
                       :minute-label="$t('orderSetup.store.fulfillmentTime.timeSelection.minute.label')"
                       :minute-placeholder="$t('orderSetup.store.fulfillmentTime.timeSelection.minute.placeholder')"
                       :native-input-label="$t('orderSetup.store.fulfillmentTime.timeSelection.time.label')"
                       ref="timeInput"/>

        <n-google-places-input
            v-if="!forDelivery"
            :value="addressSearchQuery"
            @input="$emit('update:addressSearchQuery', $event)"
            ref="google-places-input"
            @place-selected="placeSelected"
            :geolocation="useGeolocationFeatures"
            :country-restriction="MapCountryRestrictions"
            :label="$t('orderSetup.store.collectionSearchArea.label')"
            :placeholder="$t('orderSetup.store.collectionSearchArea.placeholder')"
            :geolocation-hint="$t('addressSearch.geolocation')"
            :result-not-selected-error="$t('addressSearch.errors.resultNotSelected')"
            :non-street-address-error="$t('addressSearch.errors.nonStreetAddress')">
        </n-google-places-input>
      </n-form>


      <!-- Kerbside collection -->
      <div v-if="kerbsideCollectionEnabled && !forDelivery && isValidTimeSelection && hasChosenAddress"
           class="form-group">
        <!-- Due to COVID-19, kerbside collection is the only collection method allowed -->
        <n-alert :value="kerbsideOnlyCollection && kerbsideOnlyCollectionMessage" info class="mb-3">
          {{ kerbsideOnlyCollectionMessage }}
        </n-alert>
        <!-- Kerbside is available from 1 or more store -->
        <div v-if="kerbsideCollectionAvailable || loadingStores " class="form-group"
             :class="{'form--inline wrap': $breakpoints.smUp}">
          <n-chip secondary class="kerbside-collection-label-badge" :class="{'mb-2': $breakpoints.xs}">
            {{ $t('orderSetup.store.kerbside.labelBadge') }}
          </n-chip>
          <n-checkbox :disabled="kerbsideOnlyCollection" :value="kerbsideCollect"
                      @input="$emit('update:kerbsideCollect', $event)" class="kerbside-collection-input flex-grow"
                      :label="$t('orderSetup.store.kerbside.label')" name="kerbside-collection"/>
        </div>
        <!-- Kerbside is unavailable -->
        <span v-else class="grey--text">
          {{
            kerbsideOnlyCollection ? $t('orderSetup.store.kerbside.forcedKerbsideunavailable') : $t('orderSetup.store.kerbside.unavailable')
          }}
        </span>

        <template v-if="kerbsideCollect">
          <n-input v-model="customerVehicle.make" maxlength="20"
                   :label="$t('orderSetup.store.kerbside.vehicleInfo.make.label')"
                   :placeholder="$t('orderSetup.store.kerbside.vehicleInfo.make.placeholder')" name="vehicle-make"
                   required/>
          <n-select v-model="customerVehicle.color" :label="$t('orderSetup.store.kerbside.vehicleInfo.color.label')"
                    name="vehicle-color" required>
            <option disabled :value="null">{{ $t('orderSetup.store.kerbside.vehicleInfo.color.placeholder') }}</option>
            <option v-for="color in vehicleColors" :value="color.value" :key="color.value">{{ color.name }}</option>
          </n-select>
          <n-input v-model="customerVehicle.registration" maxlength="10"
                   :label="$t('orderSetup.store.kerbside.vehicleInfo.registration.label')"
                   :placeholder="$t('orderSetup.store.kerbside.vehicleInfo.registration.placeholder')"
                   name="vehicle-registration" required/>
        </template>
      </div>

      <section v-if="isValidTimeSelection && hasChosenAddress" class="form-group">

        <div class="flexbox align-center">
          <label>{{ $t('orderSetup.store.results.label') }}</label>
          <n-spacer/>
          <!-- Show filters button -->
          <n-button v-if="availableStoreFilters.length" @click.native="showFilters = !showFilters" icon flat
                    class="lumo-pink--text" :value="showFilters" active-class="lumo-pink white--text">
            <n-icon>filter</n-icon>
          </n-button>
          <!-- Stores Loading -->
          <n-progress-circular v-if="loadingStores" size="45" indeterminate/>
        </div>

        <!-- Store Filters -->
        <div v-if="showFilters" class="flexbox row wrap mb-4">
          <n-button v-for="filter in availableStoreFilters" @click.native="selectedFilter = filter.type"
                    :key="filter.type"
                    :class="{'secondary--text': selectedFilter != filter.type, 'secondary black--text': selectedFilter == filter.type}"
                    small class="px-3" style="border-radius: 5px;">
            {{ filter.title }}
          </n-button>
        </div>

        <!-- No Stores Error messaging -->
        <n-alert v-if="noStoresFound" error :value="true">
          {{ $t('orderSetup.store.results.errors.noStores') }}
        </n-alert>
        <!-- Store Results -->
        <n-list v-else>
          <n-list-item v-for="store in displayStores" :key="store.id">
            <n-list-tile selectable :disabled="!canOrderFromStore(store)" class="store">
              <n-list-tile-content>
                <n-radio v-model="selectedStore" :radio-value="store" :label="store.displayName" name="selectedStore"
                         collapse-empty-content>
                  <div slot="label" slot-scope="{label}" class="flexbox column">
                    <span class="mb-1">{{ label }}</span>
                    <div v-if="canOrderFromStore(store)">
                      <n-chip class="black mb-1">{{
                          $t('orderSetup.store.results.storeOrderReady', {
                            orderType: $t(`orderType.${orderTypeKey}`),
                            time: $options.filters.date(store.capacity.expectedTime, 'time')
                          })
                        }}
                      </n-chip>
                      <template v-if="!forDelivery && store.address">
                        <p>{{ store.address }}</p>
                        <small class="black--text">
                          {{
                            $t('store.openHours', {
                              startTime: $options.filters.date(store.getActiveTimeSlot(orderType).open, 'time'),
                              endTime: $options.filters.date(store.getActiveTimeSlot(orderType).closed, 'time')
                            })
                          }}
                        </small>
                      </template>
                    </div>
                    <div v-else>
                      <template v-if="store.callCenterDisabled">
                        {{ $t('orderSetup.store.results.errors.callCenterStoreUnavailable') }}
                      </template>
                      <template v-else>
                        {{ $t('orderSetup.store.results.errors.storeUnavailable') }}
                      </template>
                    </div>
                  </div>
                </n-radio>
              </n-list-tile-content>
              <n-list-tile-action class="pt-2">
                <n-chip
                    v-if="kerbsideCollectionEnabled && !kerbsideOnlyCollection && !forDelivery && store.kerbsideCapable"
                    secondary class="mr-0 mb-2">{{ $t('orderSetup.store.results.kerbsideBadge') }}
                </n-chip>
                <small v-if="!forDelivery"
                       class="store__distance black--text mb-2">{{ store.distance | distance }}</small>
                <div>
                  <n-image v-for="(facility, index) in getStoreFacilities(store)"
                           v-if="facility.icon && facility.icon.path" :key="'facility-' + index" :alt="facility.title"
                           :title="facility.title" :src="facility.icon.path" class="store__facility"></n-image>
                </div>
              </n-list-tile-action>
            </n-list-tile>
            <n-list-divider/>
          </n-list-item>
        </n-list>

      </section>
    </n-container>

    <n-page-footer slot="footer">
      <n-container>
        <n-button class="hero-cta" @click.native.stop="$emit('finish')" :disabled="!orderSetupIsValid"
                  :loading="orderSetupLoading"
                  block primary v-track="{'order-setup:store': 'finish'}">
          <span class="nandos-hand">{{ $t('orderSetup.store.submit') }}</span>
        </n-button>
      </n-container>
    </n-page-footer>

  </n-page>
</template>

<script src="./order-setup-store.js"></script>