<template>
  <n-page pattern-bg>

    <portal to="app-header-portal">
      <n-app-header :title="$t('signIn.passwordReset.verify.titleShort')" back-title="Password reset"></n-app-header>
    </portal>

    <n-container narrow class="mt-3">

      <div class="mb-4 text-xs-center">
        <n-blocked-heading v-if="$breakpoints.mdUp" tag="h3">{{$t('signIn.passwordReset.verify.title')}}</n-blocked-heading>
        <p>{{ $t('signIn.passwordReset.verify.description', { mobilePhoneNumber }) }}</p>
      </div>

      <n-form ref="form" @submit="onSubmit" @validity="onFormValid" class="text-xs-left" style="width: 100%;">
        <n-input v-model="form_data.otp" type="number" inputmode="decimal" :exact-length="4" name="one-time-code" autocomplete="one-time-code" :label="$t('signIn.passwordReset.verify.otpLabel')" class="mb-2" required></n-input>
        <div class="form-group flexbox justify-end">
          <n-button @click.native="resendOtp" :disabled="loading" primary text-link v-track="{'verify password reset form': 'resend OTP'}">{{ $t('signIn.passwordReset.verify.resendOtpButton') }}</n-button>
        </div>
        <div class="form-group mt-5">
          <n-button primary block type="submit" :loading="loading">Submit</n-button>
        </div>
        <n-auth-server-error-handler v-if="server_error" v-scoll-into-view-on-appear @request-new-otp="resendOtp" :error="server_error" />
      </n-form>
    </n-container>

  </n-page>
</template>

<script src="password-reset-verify.js"></script>