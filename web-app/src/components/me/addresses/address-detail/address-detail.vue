<template>
  <n-page>

    <portal to="app-header-portal">
      <n-app-header :title="$t(`profile.addresses.detail.titleShort.${is_new_address ? 'new' : 'existing'}`)" back-title="Addresses"></n-app-header>
    </portal>

    <n-container>
      <n-google-places-input v-model="address.formattedAddress" @place-selected="placeSelected" :disabled="!is_new_address" :geolocation="is_new_address" :country-restriction="MapCountryRestrictions" :label="$t('profile.addresses.detail.form.search')" :placeholder="$t('addressSearch.placeholder')" :geolocation-hint="$t('addressSearch.geolocation')" :result-not-selected-error="$t('addressSearch.errors.resultNotSelected')" :non-street-address-error="$t('addressSearch.errors.nonStreetAddress')" />
      <n-form @submit="onSubmit" v-if="address_chosen">
        {{console.log('HI THERE')}}

        <n-input v-model="address.name" name="name" :label="$t('profile.addresses.detail.form.name.label')" :placeholder="$t('profile.addresses.detail.form.name.placeholder')" />
        <n-input v-model="address.building" name="building" :label="$t('profile.addresses.detail.form.building.label')" :placeholder="$t('profile.addresses.detail.form.building.placeholder')" autocomplete="shipping building" maxlength="32" />
        <n-input v-model="address.instructions" name="instructions" :label="$t('profile.addresses.detail.form.instruction.label')" :placeholder="$t('profile.addresses.detail.form.instruction.placeholder')" maxlength="32" />

        <div class="form-group flexbox">
          <n-button error outline flat v-if="!is_new_address" @click.native="deleteAddress">{{ $t('profile.addresses.detail.form.remove') }}</n-button>
          <n-spacer />
          <n-button primary with-triangle :loading="loading" type="submit" v-track="{'save address form': 'submit'}">
            {{ $t(`profile.addresses.detail.form.submit.${is_new_address ? 'new' : 'existing'}`) }}
          </n-button>
        </div>
      </n-form>
    </n-container>
  </n-page>
</template>

<script src="./address-detail.js"></script>