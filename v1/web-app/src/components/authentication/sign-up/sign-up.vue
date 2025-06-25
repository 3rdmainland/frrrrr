<template>
  <n-page pattern-bg class="sign-up">

    <portal to="app-header-portal">
      <n-app-header :title="$t('signUp.titleShort')"></n-app-header>
    </portal>
    
    <n-container narrow class="mt-3 text-xs-center">

      <n-blocked-heading v-if="$breakpoints.mdUp" tag="h3">{{ $t('signUp.titleShort') }}</n-blocked-heading>

      <n-form @submit="onSubmit" class="text-xs-left flex-grow mb-3" style="width: 100%;">

        <n-input v-model="form_data.name" name="fname" :label="$t('signUp.form.name.label')" autocomplete="given-name" required :error-message="{valueMissing: $t('signUp.form.name.errors.missing')}" />
        <n-input v-model="form_data.lastName" name="lname" :label="$t('signUp.form.lastName.label')" autocomplete="family-name" required :error-message="{valueMissing: $t('signUp.form.lastName.errors.missing')}" />
        <n-phone-input v-model="form_data.mobilePhoneNumber" name="phone" :label="$t('signUp.form.mobilePhoneNumber.label')" required :error-message="{valueMissing: $t('signUp.form.mobilePhoneNumber.errors.missing')}" />
        <n-password-input v-model="form_data.password" name="password" :label="$t('signUp.form.password.label')" :placeholder="$t('signUp.form.password.placeholder')" autocomplete="new-password" required :error-message="{valueMissing: $t('signUp.form.password.errors.missing')}" />
        <n-input v-if="LOYALTY_PROGRAM" v-model="form_data.loyaltyNumber" name="loyalty-number" :label="$t('signUp.form.loyalty.label')" autocomplete="loyalty-number">
          <span slot="help">{{ $t('signUp.form.loyalty.help') }}</span>
        </n-input>

        <n-checkbox v-model="form_data.marketingOptIn" :label="$t('signUp.form.marketing.label')" class="text-xs-left" />

        <div class="form-group mt-5">
          <n-button primary block large :loading="loading" type="submit" v-track="{'sign up form': 'submit'}">{{ $t('signUp.form.submit') }}</n-button>
        </div>

        <div class="form-group">
          <n-auth-server-error-handler v-if="server_error" v-scoll-into-view-on-appear context="password" :error="server_error" />
        </div>

        <p class="text-xs-center grey--text text--darken-2">
          <i18n slot="label" path="signUp.usageDisclaimer" tag="span">
            <a slot="tos" v-if="$isBrowserApp" :href="TERMS_AND_CONDITIONS_URL" target="_blank" class="no-wrap primary--text">{{ $t('signUp.tos') }}</a>
            <n-button slot="tos" v-else to="/sign-up/terms-and-conditions" text-link primary class="no-wrap">{{ $t('signUp.tos') }}</n-button>
          </i18n>
          <template v-if="$isBrowserApp">
            -
            <i18n path="signUp.faqs" tag="span">
              <a slot="faq" :href="FAQ_URL" target="_blank" class="primary--text">{{ $t('signUp.faq') }}</a>
            </i18n>
          </template>
        </p>

        <p class="text-xs-center grey--text text--darken-2">
          This site is protected by reCAPTCHA and the Google
          <a href="https://policies.google.com/privacy" class="primary--text">Privacy Policy</a> and
          <a href="https://policies.google.com/terms" class="primary--text">Terms of Service</a> apply.
        </p>
      </n-form>

    </n-container>

    <n-page-footer slot="footer" class="grey lighten-2">
      <n-container class="text-xs-center align-center justify-center py-2">
        <section>
          <p class="mb-1">{{ $t('signUp.signInPrompt') }}</p>
          <n-button :to="{ name: 'sign-in', query: $route.query}" secondary round small style="font-size: 0.9em;"  v-track="{'sign up form': 'go to log in form'}">{{ $t('signUp.signIn') }}</n-button>
        </section>
      </n-container>
    </n-page-footer>
    
  </n-page>
</template>

<script src="sign-up.js"></script>