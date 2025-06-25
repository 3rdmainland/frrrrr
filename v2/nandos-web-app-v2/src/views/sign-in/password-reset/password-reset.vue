<template>
    <main class="h-full text-nandos-fresh-white flex flex-col gap-12 items-center bg-[#111]">
        <div class="w-4/5 md:w-2/5 space-y-8">
            <div class="flex flex-col items-center gap-6 mt-6">
                <h1 class="text-[24px] sm:text-[30px] md:text-[44px] text-center bg-nandos-black -rotate-[1.5deg] px-4">
                   {{ $t('signIn.passwordReset.title') }}
                </h1>
        
                <p class="text-center">{{ $t('signIn.passwordReset.description')}}</p>
            </div>
    
            <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
                <NIntlPhoneInput
                    id="phone-number"
                    :label="$t('signIn.passwordReset.form.mobilePhoneNumber.label')"
                    v-model="mobilePhoneNumber"
                    initialSelectedCountryIso="ZA"
                    :placeholder="$t('signIn.passwordReset.form.mobilePhoneNumber.placeholder')"
                    :error="phoneErrorMessage"
                />

                <NInput
                    id="password"
                    :label="$t('signIn.passwordReset.form.password.label')"
                    v-model.trim="password"
                    :placeholder="$t('signIn.passwordReset.form.password.placeholder')"
                    type="password"
                    :error="passwordErrorMessage"
                />
    
                <NButton
                    class="mt-2"
                    size="lg"
                    type="submit" 
                    variant="primary"
                    :loading="loading"
                >
                    {{ $t('signIn.passwordReset.form.submit') }}
                </NButton>
    
                <!-- Error Alert -->
                <AuthServerErrorAlert :errorCode="authStore.errorCode" context="password-reset" :customErrorMsg="errorMsg"/>
            </form>
        </div>
    </main>
</template>

<script setup lang="ts">
import { z } from 'zod';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/useAuthStore';
import { toTypedSchema } from '@vee-validate/zod';
import { usePreserveRouter } from '@/composables/usePreserveRouter';
import { useField, useForm } from 'vee-validate';
import { NIntlPhoneInput, NInput, NButton } from 'nandos-core-ui-v2';
import AuthServerErrorAlert from '@/components/authentication/auth-server-error-alert/auth-server-error-alert.vue';

const { t } = useI18n();
const authStore = useAuthStore();
const { pushRoute } = usePreserveRouter();

// Form schema
const schema = toTypedSchema(
  z.object({
    mobilePhoneNumber: z.string()
            .regex(/^\+?\d+$/, { message: t('signIn.passwordReset.form.mobilePhoneNumber.errors.invalid') })
            .min(10, { message: t('signIn.passwordReset.form.mobilePhoneNumber.errors.short') }),
    password: z.string()
               .nonempty(t('signIn.passwordReset.form.password.errors.empty'))
               .min(6, { message: t('signIn.passwordReset.form.password.errors.short') }),
  }),
);

// Initialize form with schema
const { handleSubmit } = useForm<{mobilePhoneNumber: string; password: string}>({
  validationSchema: schema,
  initialValues: {
    mobilePhoneNumber: '',
    password: '',
  },
});

// Form v-models
const loading = ref(false);
const errorMsg = ref('');
const { value: mobilePhoneNumber, errorMessage: phoneErrorMessage } = useField<string>('mobilePhoneNumber');
const { value: password, errorMessage: passwordErrorMessage } = useField<string>('password');

// Reset Password
const onSubmit = handleSubmit(
    async ({mobilePhoneNumber, password}) => {
        loading.value = true;
        errorMsg.value = '';
        
        const passwordReset = await authStore.resetPasswordViaMobile(mobilePhoneNumber, password);
        loading.value = false;

        if (!passwordReset) {
            if (!authStore.errorCode) errorMsg.value = "Password reset failed. Please try again.";
            return;
        }
        // Success navigate to verify password
        // Store mobile number in local storage for verify view.
        // This is so that if the user refreshes we still have the mobile number to send otp to
        localStorage.setItem('password-reset-phone', mobilePhoneNumber);
        pushRoute('/sign-in/password-reset/verify');
    }
);
</script>