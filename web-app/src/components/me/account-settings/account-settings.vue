<template>
  <n-page>

    <portal to="app-header-portal">
      <n-app-header :title="$t('profile.settings.titleShort')" back-title="Profile"></n-app-header>
    </portal>

    <n-container narrow>
      <div v-if="user && user.hasPassword" class="mb-6">
        <h2>{{ $t('profile.settings.changePassword.title') }}</h2>

        <n-form @submit="changePassword">
          <n-password-input v-model="password_form_data.old" name="old_password" :label="$t('profile.settings.changePassword.form.currentPassword')" autocomplete="current-password" required />
          <n-password-input v-model="password_form_data.new" name="new_password" :label="$t('profile.settings.changePassword.form.newPassword')" autocomplete="new-password" required />
          <div class="form-group flexbox">
            <n-spacer />
            <n-button primary with-triangle :loading="loading" type="submit" v-track="{'update password form': 'submit'}">{{ $t('profile.settings.changePassword.form.submit') }}</n-button>
          </div>
          <n-me-server-error-handler context="password" :error="password_server_error"></n-me-server-error-handler>
        </n-form>
      </div>    

      <div class="text-xs-center mb-5">
        <h2 class="mb-2">{{ $t('profile.settings.changePhone.title') }}</h2>
        <p class="display-1">{{ $t('profile.settings.changePhone.description') }}</p>
      </div>

      <n-form @submit="changeCellphone">

        <n-phone-input v-model="cellphone_form_data.mobilePhoneNumber" name="phone" :label="$t('profile.settings.changePhone.form.mobilePhoneNumber')" required />

        <div class="form-group flexbox">
          <n-spacer />
          <n-button primary with-triangle :loading="loading" type="submit" v-track="{'update mobile number form': 'submit'}">{{ $t('profile.settings.changePhone.form.submit') }}</n-button>
        </div>
        <n-me-server-error-handler :error="cellphone_server_error"></n-me-server-error-handler>
      </n-form>
    </n-container>
  </n-page>
</template>

<script src="./account-settings.js"></script>