<template>
  <n-page>

    <portal to="app-header-portal">
      <n-app-header :title="$t('profile.addresses.listing.titleShort')" back-title="Profile"></n-app-header>
    </portal>

    <n-container v-if="addresses">
      <h3 v-if="addresses.length === 0" class="headline">{{ $t('profile.addresses.listing.empty') }}</h3>

      <n-list class="mb-4">
        <n-list-item v-for="address in addresses" :key="address.id">
          <n-list-tile append :to="address.id">
            <n-list-tile-content>
              <n-list-tile-title>{{address.name}}</n-list-tile-title>
              <n-list-tile-sub-title>{{address.formattedAddress}}</n-list-tile-sub-title>
            </n-list-tile-content>
          </n-list-tile>
          <n-list-divider/>
        </n-list-item>
      </n-list>

      <div class="form-group flexbox">
        <n-spacer />
        <n-button append to="add" primary with-triangle>{{ $t('profile.addresses.listing.createNew') }}</n-button>
      </div>

    </n-container>

  </n-page>
</template>

<script src="./address-listing.js"></script>