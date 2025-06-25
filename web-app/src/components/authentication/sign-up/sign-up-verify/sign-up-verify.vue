<template>
  <n-page pattern-bg>

    <portal to="app-header-portal">
      <n-app-header :title="$t('signUp.verify.titleShort')" back-title="Sign up"></n-app-header>
    </portal>

    <n-container narrow>

      <div class="mb-6 text-xs-center">
       
        <n-blocked-heading v-if="$breakpoints.mdUp" tag="h3">
          <i18n path="signUp.verify.title">
            <span slot="name">{{user.name}}</span>
          </i18n>
        </n-blocked-heading>
        <p>{{ $t('signUp.verify.subtitle', {mobilePhoneNumber}) }}</p>
      </div>

      <n-form ref="form" @submit="onSubmit" @validity="onFormValid" class="text-xs-left" style="width: 100%;">

        <n-input v-model="form_data.otp" type="number" inputmode="decimal" :exact-length="4" name="one-time-code" autocomplete="one-time-code" :label="$t('signUp.verify.form.otp')" class="mb-2" required></n-input>

        <div class="flexbox justify-end">
          <n-button @click.native="resendOtp" :disabled="loading" primary text-link v-track="{'sign up verification form': 'resend OTP'}">{{ $t('signUp.verify.resendOtpButton') }}</n-button>
        </div>

        <div class="form-group mt-5">
          <n-button primary type="submit" block :loading="loading" v-track="{'sign up verification form': 'submit'}">Submit</n-button>
        </div>
        <n-auth-server-error-handler v-if="server_error" v-scoll-into-view-on-appear :error="server_error" @request-new-otp="resendOtp" />
      </n-form>

    </n-container>
  </n-page>
</template>

<script src="./sign-up-verify.js"></script>