<template>
    <BaseOtpVerify :submit-otp="verifyPasswordReset" :mobile-number="mobilePhoneNumber">
        <template #header> {{ $t('signIn.passwordReset.verify.title') }}</template>
        <template #subtitle>{{ $t('signIn.passwordReset.verify.description', {mobilePhoneNumber: authStore.user?.mobilePhoneNumber}) }}</template>
    </BaseOtpVerify>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore';
import BaseOtpVerify from '@/components/authentication/base-otp-verify.vue';

const authStore = useAuthStore();

// Set the mobile number 
const LS_PHONE_KEY = 'password-reset-phone';
const mobilePhoneNumber = localStorage.getItem(LS_PHONE_KEY) || '';

async function verifyPasswordReset(otp: string) {
    // There's no mobile no. and OTP associated with a password reset
    if (!mobilePhoneNumber) return {success: false};
    const success = await authStore.verifyResetPassword(mobilePhoneNumber, otp);

    // Remove key once verified
    if (success) {
        localStorage.removeItem(LS_PHONE_KEY);
    }

    return { success };
}
</script>