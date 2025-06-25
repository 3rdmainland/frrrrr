<template>
  <n-alert v-if="error" :value="error != null" error>
    <p>
      <template v-if="error.code === 'INVALID_CREDENTIALS'">
        {{ $t('profile.settings.errors.invalidCredentials') }}
      </template>

      <template v-else-if="error.code === 'DUPLICATE_CREDENTIALS'">
        {{ $t('profile.settings.errors.duplicateCredentials') }}
      </template>

      <template v-else>
        {{ $t('authenticationErrors.unknown') }}
      </template>
    </p>
  </n-alert>
</template>

<script src="me-server-error-handler.js"></script>