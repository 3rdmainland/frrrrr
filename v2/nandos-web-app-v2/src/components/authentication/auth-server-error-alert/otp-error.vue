<template>
    <I18nT :keypath="`${keypathPrefix}.${i18nKey}`">
        <template #getNewOtp>
            <NButton @click="$emit('resend-otp')" variant="unstyled" class="rounded-none font-bold border-b-1 border-b-white hover:border-b-transparent cursor-pointer">
                <span class="text-nandos-yellow">{{ $t(`${keypathPrefix}.getNewOtp`) }}</span>
            </NButton>
        </template>
    </I18nT>
</template>

<script setup lang="ts">
import { I18nT } from 'vue-i18n';

defineEmits(['resend-otp']);

defineProps<{
    keypathPrefix: string,
    i18nKey: string
}>();
</script>