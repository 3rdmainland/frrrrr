<template>
    <BaseOtpVerify :submit-otp="verifyRegistration" :mobile-number="authStore.user?.mobilePhoneNumber">
        <template #header> {{ $t('signUp.verify.title', {name: authStore.user?.name}) }}</template>
        <template #subtitle>{{ $t('signUp.verify.subtitle', {mobilePhoneNumber: authStore.user?.mobilePhoneNumber}) }}</template>
    </BaseOtpVerify>
</template>

<script setup lang="ts">
import BaseOtpVerify from '@/components/authentication/base-otp-verify.vue';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();

async function verifyRegistration(otp: string) {
    const success = await authStore.verifyRegistration(otp);
    return { success };
}
</script>