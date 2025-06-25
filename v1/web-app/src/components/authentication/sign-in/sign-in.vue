<template>
  <n-page pattern-bg class="sign-in">

    <portal to="app-header-portal">
      <n-app-header :title="$t('signIn.titleShort')"></n-app-header>
    </portal>

    <n-container narrow class="mt-3 text-xs-center">

      <n-blocked-heading v-if="$breakpoints.mdUp" tag="h3">{{ $t('signIn.titleShort') }}</n-blocked-heading>

      <n-form @submit="onSubmit" class="text-xs-left flex-grow mb-3" style="width: 100%;">

        <n-phone-input v-model="form_data.mobilePhoneNumber" name="phone" :label="$t('signIn.form.mobilePhoneNumber.label')" required :error-message="{valueMissing: $t('signIn.form.mobilePhoneNumber.errors.missing')}" />
        <n-password-input v-model="form_data.password" name="password" :label="$t('signIn.form.password.label')" autocomplete="current-password" required :error-message="{valueMissing: $t('signIn.form.password.errors.missing')}" class="mb-2">
          <n-button text-link primary :to="{ path: '/sign-in/password-reset', query: $route.query}" class="display-1 mt-1" v-track="{'log in form': 'forgot password'}">
            {{ $t('signIn.form.forgotPassword') }}
          </n-button>
        </n-password-input>


        <div class="form-group mt-5">
          <n-button primary block large :loading="loading" type="submit" v-track="{'log in form': 'submit'}">
            {{ $t('signIn.form.submit') }}
          </n-button>
        </div>

        <div class="form-group">
          <n-auth-server-error-handler v-if="server_error" v-scoll-into-view-on-appear context="password" :error="server_error" />
        </div>

        <p class="text-xs-center grey--text text--darken-2">
          <i18n path="signIn.usageDisclaimer" tag="span">
            <a slot="tos" v-if="$isBrowserApp" :href="TERMS_AND_CONDITIONS_URL" target="_blank" class="primary--text">{{ $t('signIn.tos') }}</a>
            <n-button slot="tos" v-else to="/sign-in/terms-and-conditions" text-link primary>{{ $t('signIn.tos') }}</n-button>
          </i18n>
          <template v-if="$isBrowserApp">
            -
            <i18n path="signIn.faqs" tag="span">
              <a slot="faq" :href="FAQ_URL" target="_blank" class="primary--text">{{ $t('signIn.faq') }}</a>
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
          <p class="mb-1">{{ $t('signIn.signUpPrompt') }}</p>
          <n-button :to="{ path: '/sign-up', query: $route.query}" secondary round small style="font-size: 0.9em;" v-track="{'log in form': 'go to sign up form'}">{{ $t('signIn.signUp') }}</n-button>
        </section>
      </n-container>
    </n-page-footer>

  </n-page>
</template>

<script src="sign-in.js"></script>