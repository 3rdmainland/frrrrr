<template>
    <NAlert :model-value="isVisible" @update:model-value="isVisible = false" variant="error">

        <template v-if="errorCode === AUTH_ERROR_CODE.INVALID_CREDENTIALS">
            <template v-if="context === 'password'">
                {{ $t(`${keypathPrefix}.password`) }}
            </template>
            <template v-else-if="context === 'password-reset'">
                {{ $t(`${keypathPrefix}.passwordReset`) }}
            </template>
            <template v-else-if="context === 'social'">
                {{ $t(`${keypathPrefix}.social`) }}
            </template>
        </template>

        <template v-if="errorCode === AUTH_ERROR_CODE.DUPLICATE_CREDENTIALS">
            <DuplicateCredentialsError v-if="context === 'password'" :keypath-prefix="keypathPrefix" />

            <template v-else-if="context === 'update'">
                {{ $t(`${keypathPrefix}.update`) }}
            </template>
        </template>

        <template v-if="errorCode === AUTH_ERROR_CODE.NO_OTP">
            {{ $t(`${keypathPrefix}.noOtp`) }}
        </template>

        <template v-if="errorCode === AUTH_ERROR_CODE.INVALID_OTP">
            <OTPError :keypath-prefix="keypathPrefix" i18nKey="invalidOtp" @resend-otp="$emit('resend-otp')"/>
        </template>

        <template v-if="errorCode === AUTH_ERROR_CODE.OTP_EXPIRED">
            <OTPError :keypath-prefix="keypathPrefix" i18nKey="otpExpired" @resend-otp="$emit('resend-otp')"/>
        </template>

        <template v-if="errorCode === AUTH_ERROR_CODE.TOO_MANY_OTP_ATTEMPTS">
            <OTPError :keypath-prefix="keypathPrefix" i18nKey="otpTooManyAttempts" @resend-otp="$emit('resend-otp')"/>
        </template>

        <template v-else-if="errorCode === AUTH_ERROR_CODE.INVALID_MOBILE_PHONE_NUMBER">
            {{ $t('authenticationErrors.invalidMobileNumber') }}
        </template>

        <template v-else-if="errorCode === AUTH_ERROR_CODE.INVALID_EMAIL">
            {{ $t('authenticationErrors.invalidEmail') }}
        </template>

        <template v-else-if="errorCode === AUTH_ERROR_CODE.INVALID_DATE">
            {{ $t('authenticationErrors.invalidDate') }}
        </template>

        <template v-else-if="errorCode === AUTH_ERROR_CODE.INVALID_PASSWORD">
            {{ $t('authenticationErrors.invalidPassword') }}
        </template>

        <template v-if="customErrorMsg">
            {{ customErrorMsg }}
        </template>
        
    </NAlert>
</template>

<script setup lang="ts">
import { NAlert } from 'nandos-core-ui-v2';
import { AUTH_ERROR_CODE } from 'nandos-types/http';
import { computed, ref, watch } from 'vue';
import OTPError from './otp-error.vue';
import DuplicateCredentialsError from './duplicate-credentials-error.vue';

defineEmits(['resend-otp']);

const props = defineProps<{
    context?: string,
    errorCode: string,
    customErrorMsg?: string
}>();

// Alert
const isVisible = ref(false);
// Auto open/close the alert when the errorCode or customErrorMsg is empty
watch([
        () => props.errorCode, 
        () => props.customErrorMsg
    ], 
    () => {
        isVisible.value = (props.errorCode || props.customErrorMsg) ? true : false;
    }
);

// I18n key prefix
const keypathPrefix = computed(() => {
    switch (props.errorCode) {
        case AUTH_ERROR_CODE.INVALID_CREDENTIALS:
            return "authenticationErrors.invalidCredentials";
        case AUTH_ERROR_CODE.DUPLICATE_CREDENTIALS:
            return "authenticationErrors.duplicateCredentials";
        case AUTH_ERROR_CODE.NO_OTP:
            return "authenticationErrors.otp"
        case AUTH_ERROR_CODE.INVALID_OTP:
            return "authenticationErrors.otp"
        case AUTH_ERROR_CODE.OTP_EXPIRED:
            return "authenticationErrors.otp"
        case AUTH_ERROR_CODE.TOO_MANY_OTP_ATTEMPTS:
            return "authenticationErrors.otp"
        default:
            return '';
    }
});
</script>