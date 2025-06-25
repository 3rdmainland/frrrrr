<template>
  <n-page pattern-bg>

    <portal to="app-header-portal">
      <n-app-header :title="$t('storeListing.titleShort')"></n-app-header>
    </portal>

    <n-container narrow>
      <!-- Address search input -->
      <n-google-places-input v-model="query" @place-selected="placeSelected" geolocation :country-restriction="MapCountryRestrictions" :label="$t('storeListing.locationSearch')" :placeholder="$t('addressSearch.placeholder')" :geolocation-hint="$t('addressSearch.geolocation')" :result-not-selected-error="$t('addressSearch.errors.resultNotSelected')" :non-street-address-error="$t('addressSearch.errors.nonStreetAddress')"/>

      <!-- Store tools -->
      <section v-if="display_stores.length" class="flexbox align-center">
        <label>{{ $t('storeListing.results.label') }}</label>
        <n-spacer/>
        <!-- Show map button -->
        <n-button @click.native="show_map = true" icon flat v-track="{'view stores on map': 'store listing'}" class="my-0">
          <n-icon>map_pin</n-icon>
        </n-button>
        <!-- Show filters button -->
        <n-button v-if="available_store_filters.length" @click.native="show_filters = !show_filters" flat :icon="$breakpoints.smDown" :small="$breakpoints.mdUp" :primary="show_filters" class="my-0">
          <n-icon v-if="$breakpoints.smDown">filter</n-icon>
          <span v-else>{{ $t('storeListing.results.filters.title') }}</span>
        </n-button>
      </section>
      <!-- Filters -->
      <section v-if="show_filters" class="flexbox elevation-2 mb-3 justify-stretch">
        <n-button v-for="filter in available_store_filters" @click.native="store_type_filter = filter.type" :key="filter.type" flat small :primary="store_type_filter == filter.type" class="order-setup__filter-btn">
          {{ filter.title }}
        </n-button>
      </section>

      <!-- Map -->
      <n-map
          v-if="show_map"
          :latitude="selected_address.latitude"
          :longitude="selected_address.longitude"
          :zoom="10"
          :markers="map_markers"
          fullscreen
          zoom-control
          street-view-control>
        <n-button slot="custom-controls" @click.native="show_map = false" icon>
          <n-icon>close</n-icon>
        </n-button>

        <template slot="info-window" slot-scope="{activeMarker, close}">
          <div v-if="activeMarker">
            <h5>{{ activeMarker.data.displayName }}</h5>
            <p v-if="activeMarker.data.facilities && activeMarker.data.facilities.length">
              <n-image v-for="(facility, index) in activeMarker.data.facilities" v-if="facility.icon && facility.icon.path" :key="'facility-' + index" :alt="facility.title" :title="facility.title" :src="facility.icon.path" class="store__facility" />
            </p>
            <p v-if="activeMarker.data.address">{{ activeMarker.data.address }}</p>
            <p v-if="activeMarker.data.phone && activeMarker.data.phone.length" v-for="number in activeMarker.data.phone">
              <a :href="'tel:' + number.replace(/ /g, '')" class="primary--text">{{ number }}</a>
            </p>
            <div class="flexbox">
              <n-icon class="mr-2">time</n-icon>
              <span>
                <strong>{{ $t('orderType.delivery') }}:</strong>
                {{
                  $t('store.openHours', {
                    startTime: $options.filters.date(activeMarker.data.getActiveTimeSlot('DELIVERY').open, 'time'),
                    endTime: $options.filters.date(activeMarker.data.getActiveTimeSlot('DELIVERY').closed, 'time')
                  })
                }}
                <br>
                <strong>{{ $t('orderType.collection') }}:</strong>
                {{
                  $t('store.openHours', {
                    startTime: $options.filters.date(activeMarker.data.getActiveTimeSlot('COLLECTION').open, 'time'),
                    endTime: $options.filters.date(activeMarker.data.getActiveTimeSlot('COLLECTION').closed, 'time')
                  })
                }}
              </span>
            </div>
          </div>
        </template>
      </n-map>

      <section v-if="no_stores_found">{{ $t('storeListing.results.errors.noStores') }}</section>
      <!-- Store listing -->
      <n-list v-else>
        <n-list-item v-for="store in display_stores" :key="store.id">
          <n-list-tile class="store">
            <n-list-tile-content>
              <n-list-tile-title class="store__title">
                {{ store.displayName }}
              </n-list-tile-title>
              <n-list-tile-sub-title>
                <p v-if="store.address">{{ store.address }}</p>
                <p v-if="store.phone && store.phone.length" v-for="number in store.phone">
                  <a :href="'tel:' + number.replace(/ /g, '')" class="primary--text">{{ number }}</a>
                </p>
                <div class="flexbox">
                  <n-icon class="mr-2">time</n-icon>
                  <span>
                      <strong>{{ $t('orderType.delivery') }}:</strong>
                      {{
                      $t('store.openHours', {
                        startTime: $options.filters.date(store.getActiveTimeSlot('DELIVERY').open, 'time'),
                        endTime: $options.filters.date(store.getActiveTimeSlot('DELIVERY').closed, 'time')
                      })
                    }}
                      <br>
                      <strong>{{ $t('orderType.collection') }}:</strong>
                      {{
                      $t('store.openHours', {
                        startTime: $options.filters.date(store.getActiveTimeSlot('COLLECTION').open, 'time'),
                        endTime: $options.filters.date(store.getActiveTimeSlot('COLLECTION').closed, 'time')
                      })
                    }}
                    </span>
                </div>
              </n-list-tile-sub-title>
            </n-list-tile-content>
            <n-list-tile-action>
              <div class="store__distance">
                <n-icon small>navigation</n-icon>
                {{ store.distance | distance }}
              </div>
              <div>
                <n-image v-for="(facility, index) in store.facilities" v-if="facility.icon && facility.icon.path" :key="'facility-' + index" :alt="facility.title" :title="facility.title" :src="facility.icon.path" class="store__facility" />
              </div>
            </n-list-tile-action>
          </n-list-tile>
          <n-list-divider/>
        </n-list-item>
      </n-list>
    </n-container>
  </n-page>
</template>

<script src="./store-listing.js"></script>