<template>
    <I18nT :keypath="`${keypathPrefix}.create.message`">
        <template #login>
            <RouterLink :to="preserveTo('/sign-in')" class="text-nandos-yellow font-bold border-b-1 border-b-white hover:border-b-transparent">{{ $t(`${keypathPrefix}.create.login`) }}</RouterLink>
        </template>
        <template #resetPassword>
            <RouterLink :to="preserveTo('/sign-in/password-reset')" class="text-nandos-yellow font-bold border-b-1 border-b-white hover:border-b-transparent">{{ $t( `${keypathPrefix}.create.resetPassword`) }}</RouterLink>
        </template>
    </I18nT>
</template>

<script setup lang="ts">
import { I18nT } from 'vue-i18n';
import { usePreserveRouter } from '@/composables/usePreserveRouter';

defineProps<{
    keypathPrefix: string,
}>();

const { preserveTo } = usePreserveRouter();
</script>