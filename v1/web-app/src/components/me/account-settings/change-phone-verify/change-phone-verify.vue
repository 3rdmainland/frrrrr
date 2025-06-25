<template>
  <n-page pattern-bg>
    <portal to="app-header-portal">
      <n-app-header :title="$t('profile.settings.changePhone.verify.titleShort')" back-title="Settings"></n-app-header>
    </portal>

    <n-container narrow class="text-xs-center">
      <p>{{ $t('profile.settings.changePhone.verify.description', {mobilePhoneNumber}) }}</p>

      <n-form ref="form" @submit="onSubmit" @validity="onFormValid" class="text-xs-left">
        <n-input v-model="form_data.otp" type="number" inputmode="decimal" :exact-length="4" name="one-time-code" autocomplete="one-time-code" :label="$t('profile.settings.changePhone.verify.form.otp')" required></n-input>
        <div class="form-group text-xs-center">
          <n-button @click.native="resendOtp" :disabled="loading" primary flat small>{{ $t('profile.settings.changePhone.verify.resendOtpButton') }}</n-button>
          <n-button primary type="submit" :loading="loading">Submit</n-button>
        </div>
        <n-auth-server-error-handler v-if="server_error" v-scoll-into-view-on-appear @request-new-otp="resendOtp" :error="server_error" />
      </n-form>
    </n-container>
  </n-page>
</template>

<script src="change-phone-verify.js"></script>