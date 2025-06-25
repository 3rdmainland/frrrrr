<template>
  <n-page pattern-bg>

    <portal to="app-header-portal">
      <n-app-header :title="$t('signIn.passwordReset.titleShort')" back-title="Log in"></n-app-header>
    </portal>

    <n-container narrow class="mt-3">

      <div class="mb-4 text-xs-center">
        <n-blocked-heading v-if="$breakpoints.mdUp" tag="h3">{{$t('signIn.passwordReset.title')}}</n-blocked-heading>
        <p>{{ $t('signIn.passwordReset.description') }}</p>
      </div>

      <n-form @submit="onSubmit" class="text-xs-left" style="width: 100%;">

        <n-phone-input v-model="form_data.mobilePhoneNumber" name="phone" :label="$t('signIn.passwordReset.form.mobilePhoneNumber')" required />
        <n-password-input v-model="form_data.password" name="password" :label="$t('signIn.passwordReset.form.password')" autocomplete="new-password" required />

        <div class="form-group text-xs-center mt-5">
          <n-button primary block :loading="loading" type="submit" v-track="{'password reset form': 'submit'}">{{ $t('signIn.passwordReset.form.submit') }}</n-button>
        </div>
        <n-auth-server-error-handler v-if="server_error" v-scoll-into-view-on-appear context="password-reset" :error="server_error" />
      </n-form>

    </n-container>

  </n-page>
</template>

<script src="./password-reset.js"></script>