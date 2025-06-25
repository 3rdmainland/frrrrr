<template>
  <n-page>

    <portal to="app-header-portal">
      <n-app-header :title="$t('profile.info.titleShort')" back-title="Profile"></n-app-header>
    </portal>

    <n-container v-if="ready" narrow>
      <n-form @submit="onSubmit">

        <n-input v-model="user.name" name="fname" :label="$t('profile.info.form.name')" autocomplete="given-name" required></n-input>
        <n-input v-model="user.lastName" name="lname" :label="$t('profile.info.form.lastName')" autocomplete="family-name" required></n-input>
        <n-input v-model="user.email" type="email" inputmode="email" name="email" :label="$t('profile.info.form.email')" autocomplete="email"></n-input>
        <n-input v-if="LOYALTY_PROGRAM" v-model="user.loyaltyNumber" name="loyalty-number" :label="$t('profile.info.form.loyalty')" autocomplete="loyalty-number"></n-input>
        
        <label>{{ $t('profile.info.form.birthday.label') }}</label>
        <div class="form-group form--inline align-start">
          <n-select v-model="birth_day" :label="$t('profile.info.form.birthday.day')" style="flex: 1 0 auto;">
            <option disabled :value="null">{{ $t('profile.info.form.birthday.day') }}</option>
            <option v-for="day in 31" :value="day | padStart" :key="day">{{day}}</option>
          </n-select>
          <n-select v-model="birth_month" :label="$t('profile.info.form.birthday.month')" style="flex: 1 0 auto;">
            <option disabled :value="null">{{ $t('profile.info.form.birthday.month') }}</option>
            <option v-for="(month, idx) in months" :value="idx | padStart" :key="idx">{{month}}</option>
          </n-select>
          <n-select v-model="birth_year" :label="$t('profile.info.form.birthday.year')" style="flex: 1 0 auto;">
            <option disabled :value="null">{{ $t('profile.info.form.birthday.year') }}</option>
            <option v-for="year in 90" :value="firstBirthYear - year" :key="firstBirthYear - year">{{firstBirthYear - year}}</option>
          </n-select>
        </div>

        <n-select v-model="user.preferences.flavour" :label="$t('profile.info.form.preference.flavour.label')" style="flex: 1 0 auto;">
          <option :value="null">{{ $t('profile.info.form.preference.flavour.none') }}</option>
          <option v-for="(flavourName, flavourId) in systemFlavours" :value="flavourId" :key="flavourId">{{flavourName}}</option>
        </n-select>

        <div class="form-group flexbox">
          <n-spacer />
          <n-button primary with-triangle :loading="loading" type="submit" v-track="{'update profile form': 'submit'}">{{ $t('profile.info.form.submit') }} </n-button>
        </div>
        <n-auth-server-error-handler v-if="server_error" v-scoll-into-view-on-appear context="update" :error="server_error" />
      </n-form>
    </n-container>
    
  </n-page>
</template>

<script src="info.js"></script>