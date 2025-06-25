<template>
    <BaseOtpVerify :submit-otp="verifyMobilePhoneChange" :mobile-number="newMobilePhone">
        <template #header>
            {{ $t('profile.settings.changePhone.verify.title') }}
        </template>
        <template #subtitle>
            {{ $t('profile.settings.changePhone.verify.description', {newMobilePhone}) }}
        </template>
    </BaseOtpVerify>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore';
import BaseOtpVerify from '@/components/authentication/base-otp-verify.vue';

const authStore = useAuthStore();

const LS_PHONE_KEY = 'verify-phone-change'
const newMobilePhone = localStorage.getItem(LS_PHONE_KEY) || '';

async function verifyMobilePhoneChange(otp: string) {
    // There must be a mobile number associated with an otp
    if (!newMobilePhone) return {success: false};

    const success = await authStore.verifyChangeMobilePhone(newMobilePhone, otp);
    // Remove the local storage key
    if (success) {
        localStorage.removeItem(LS_PHONE_KEY);
    }

    return {
        success,
        redirectPath: '/me'
    }
}

</script>