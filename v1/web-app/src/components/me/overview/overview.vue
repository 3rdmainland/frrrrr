<template>
  <n-page pattern-bg>

    <portal to="app-header-portal">
      <n-app-header title="Profile" back-title="Profile"></n-app-header>
    </portal>
    
    <n-container>

      <n-list class="mb-4">
        
        <n-list-item>
          <n-list-tile to="/me/history">
            <n-list-tile-content>
              <n-list-tile-title>{{ $t('profile.history.title') }}</n-list-tile-title>
              <n-list-tile-sub-title>{{ $t('profile.history.subtitle') }}</n-list-tile-sub-title>
            </n-list-tile-content>
          </n-list-tile>
        </n-list-item>

        <n-list-item v-if="REGION_SUPPORTS_GIFT_CARDS">
          <n-list-tile to="/me/wallet">
            <n-list-tile-content>
              <n-list-tile-title>{{ $t('profile.wallet.title') }}</n-list-tile-title>
              <n-list-tile-sub-title>{{ $t('profile.wallet.subtitle') }}</n-list-tile-sub-title>
            </n-list-tile-content>
          </n-list-tile>
        </n-list-item>

        <n-list-item>
          <n-list-tile to="/me/info">
            <n-list-tile-content>
              <n-list-tile-title>{{ $t('profile.info.title') }}</n-list-tile-title>
              <n-list-tile-sub-title>{{ $t('profile.info.subtitle') }}</n-list-tile-sub-title>
            </n-list-tile-content>
            <n-list-tile-action narrow>
              <n-icon>edit</n-icon>
            </n-list-tile-action>
          </n-list-tile>
        </n-list-item>

        <n-list-item>
          <n-list-tile to="/me/addresses">
            <n-list-tile-content>
              <n-list-tile-title>{{ $t('profile.addresses.title') }}</n-list-tile-title>
              <n-list-tile-sub-title>{{ $t('profile.addresses.subtitle') }}</n-list-tile-sub-title>
            </n-list-tile-content>
            <n-list-tile-action narrow>
              <n-icon>edit</n-icon>
            </n-list-tile-action>
          </n-list-tile>
        </n-list-item>

        <n-list-item>
          <n-list-tile to="/me/settings">
            <n-list-tile-content>
              <n-list-tile-title>{{ $t('profile.settings.title') }}</n-list-tile-title>
              <n-list-tile-sub-title>{{ $t('profile.settings.subtitle') }}</n-list-tile-sub-title>
            </n-list-tile-content>
            <n-list-tile-action narrow>
              <n-icon>edit</n-icon>
            </n-list-tile-action>
          </n-list-tile>
        </n-list-item>

        <n-list-item>
          <n-list-tile to="/me/credit-cards">
            <n-list-tile-content>
              <n-list-tile-title>{{ $t('profile.creditCards.title') }}</n-list-tile-title>
              <n-list-tile-sub-title>{{ $t('profile.creditCards.subtitle') }}</n-list-tile-sub-title>
            </n-list-tile-content>
            <n-list-tile-action narrow>
              <n-icon>edit</n-icon>
            </n-list-tile-action>
          </n-list-tile>
        </n-list-item>

      </n-list>

      <div class="flexbox justify-space-between" style="flex-wrap: wrap-reverse;">
        <n-button @click.stop="startAccountDeletion" :loading="deleteAccountConfirmation.otpSending" small outline error class="mt-3" v-track="{'profile': 'delete'}">{{ $t('profile.delete.cta') }}</n-button>
        <n-button @click.stop="logout" small dark  class="mt-3" v-track="{'profile': 'log out'}">{{ $t('profile.logOut.title') }}</n-button>
      </div>

    </n-container>

    <n-dialog slot="floating-content" v-model="deleteAccountConfirmation.show">
      <div class="pa-5 block-skewed white text-xs-center">
        <h2>{{ $t('profile.delete.title') }}</h2>
        <p>{{ $t('profile.delete.description') }}</p>


        <n-form @submit="deleteAccount" class="text-xs-left">
          <n-input v-model="deleteAccountConfirmation.formData.otp" type="number" inputmode="decimal" :exact-length="4" name="otp" :label="$t('profile.delete.verify.otpLabel')" required></n-input>
          <div class="form-group text-xs-center">
            <n-button @click.native="startAccountDeletion" :disabled="deleteAccountConfirmation.loading" :loading="deleteAccountConfirmation.otpSending" primary flat small v-track="{'verify password reset form': 'resend OTP'}">{{ $t('profile.delete.verify.resendOtpButton') }}</n-button>
            <n-button primary type="submit" :disabled="deleteAccountConfirmation.loading" :loading="deleteAccountConfirmation.loading">Submit</n-button>
          </div>
          <n-auth-server-error-handler @request-new-otp="startAccountDeletion" :error="deleteAccountConfirmation.formError"></n-auth-server-error-handler>
        </n-form>

        <!-- <n-button primary @click.native="abortCardDelete">{{ $t('profile.creditCards.listing.confirmDelete.cancel') }}</n-button> -->
        <!-- <n-button outline @click.native="delete">{{ $t('profile.creditCards.listing.confirmDelete.confirm') }}</n-button> -->
      </div>
    </n-dialog>

  </n-page>
</template>

<script src="overview.js"></script>