<template>
    <main class="h-full bg-[#111] flex flex-col items-center">

        <h1 class="text-nandos-fresh-white text-[30px] md:text-[44px] text-center bg-nandos-black -rotate-[1.5deg] px-4 mt-8">
            <slot name="header"></slot>
        </h1>

        <div class="w-4/5 md:w-2/5 space-y-4 mt-6">
            <slot name="form"></slot>

            <!-- Error Alert -->
            <AuthServerErrorAlert :errorCode="authStore.errorCode" context="password" :customErrorMsg="customErrorMsg"/>
        
            <p class="text-nandos-fresh-white-800 text-center">
                <I18nT keypath="policies.usageDisclaimer">
                    <template #usage>
                        <slot name="usage"></slot>
                    </template>
                </I18nT>

                <br/>
                <RouterLink to="/" class="text-nandos-fresh-white border-b-1">{{ $t('policies.tos') }}</RouterLink>
            </p>
    
            <p class="text-nandos-fresh-white-800 text-center">
                {{ $t('policies.faqs') }}
               <RouterLink to="/" class="text-nandos-fresh-white border-b-1">{{ $t('policies.faq') }}</RouterLink>
            </p>
    
            <p class="text-nandos-fresh-white-800 text-center">
                This site is protected by reCAPTCHA and the
                <br/>
                <a href="https://policies.google.com/privacy" target="_blank" class="text-nandos-fresh-white border-b-1">Google Privacy Policy</a> and 
                <a href="https://policies.google.com/terms" target="_blank" class="text-nandos-fresh-white border-b-1">Terms of Service</a> apply.
            </p>
    
            <footer class="w-full flex flex-col text-nandos-fresh-white font-medium text-center my-10 space-y-2">
                <slot name="footer"></slot>
            </footer>
        </div>
    </main>
</template>

<script setup lang="ts">
import { I18nT } from 'vue-i18n';
import { useAuthStore } from '@/stores/useAuthStore';
import AuthServerErrorAlert from './auth-server-error-alert/auth-server-error-alert.vue';

defineProps<{
    customErrorMsg?: string
}>();

const authStore = useAuthStore();
</script>