<template>
  <n-alert v-if="error" :value="error != null" error>
    <p>
      <template v-if="error.code === 'INVALID_CREDENTIALS'">
        <template v-if="context === 'password'">
          {{ $t('authenticationErrors.invalidCredentials.password') }}
        </template>
        <template v-else-if="context === 'password-reset'">
          {{ $t('authenticationErrors.invalidCredentials.passwordReset') }}
        </template>
        <template v-else-if="context === 'social'">
          {{ $t('authenticationErrors.invalidCredentials.social') }}
        </template>
      </template>

      <template v-else-if="error.code === 'DUPLICATE_CREDENTIALS'">
        <template v-if="context === 'password' || context == 'social'">
          <i18n tag="span" path="authenticationErrors.duplicateCredentials.create.message">
            <n-button slot="login" text-link secondary :to="{name: 'sign-in', query:{redirect: $route.query.redirect, jump: $route.query.jump}}">{{ $t('authenticationErrors.duplicateCredentials.create.login') }}</n-button>
            <n-button slot="resetPassword" text-link secondary :to="{path:'/sign-in/password-reset', query:{redirect: $route.query.redirect, jump: $route.query.jump}}">{{ $t('authenticationErrors.duplicateCredentials.create.resetPassword') }}</n-button>
          </i18n>
        </template>
        <template v-else-if="context == 'update'">
          {{ $t('authenticationErrors.duplicateCredentials.update') }}
        </template>
      </template>

      <template v-else-if="error.code === 'INVALID_MOBILE_PHONE_NUMBER'">
        {{ $t('authenticationErrors.invalidMobileNumber') }}
      </template>

      <template v-else-if="error.code === 'INVALID_EMAIL'">
        {{ $t('authenticationErrors.invalidEmail') }}
      </template>

      <template v-else-if="error.code === 'INVALID_DATE'">
        {{ $t('authenticationErrors.invalidDate') }}
      </template>

      <template v-else-if="error.code === 'INVALID_PASSWORD'">
        {{ $t('authenticationErrors.invalidPassword') }}
      </template>

      <template v-else-if="error.code === 'INVALID_ARGUMENT'">
        {{error.message}}

        <template v-if="context == 'gift-card' && error.meta">
          <!-- List all errors (for each card recipient)-->
          <ul class="mt-1">
            <li v-for="issue in error.meta.filter(issue => issue.status == 'FAIL')">
              {{ $t('giftCard.creation.errors', {
                  name: issue.relatedCard.toName,
                  error: $t(`authenticationErrors.${$options.filters.camelCase(issue.code)}`),
                })
              }}
            </li>
          </ul>
        </template>
      </template>

      <template v-else-if="error.code === 'INVALID_OTP'">
        <i18n tag="span" path="authenticationErrors.invalidOtp">
          <n-button slot="getNewOtp" @click.native="$emit('request-new-otp')" text-link secondary>{{ $t('authenticationErrors.getNewOtp') }}</n-button>
        </i18n>
      </template>

      <template v-else-if="error.code === 'OTP_EXPIRED'">
        <i18n tag="span" path="authenticationErrors.otpExpired">
          <n-button slot="getNewOtp" @click.native="$emit('request-new-otp')" text-link secondary>{{ $t('authenticationErrors.getNewOtp') }}</n-button>
        </i18n>
      </template>

      <template v-else-if="error.code === 'TOO_MANY_ATTEMPTS'">
        <i18n tag="span" path="authenticationErrors.otpTooManyAttempts">
          <n-button slot="getNewOtp" @click.native="$emit('request-new-otp')" text-link secondary>{{ $t('authenticationErrors.getNewOtp') }}</n-button>
        </i18n>
      </template>

      <template v-else>
        {{ $t('authenticationErrors.unknown') }}
      </template>
    </p>
  </n-alert>
</template>

<script src="auth-server-error-handler.js"></script>