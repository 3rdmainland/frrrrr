<template>
    <SettingsSection :submit-fn="updateMobilePhone" :error-msg="errorMsg">
        <template #header>
            {{ $t('profile.settings.changePhone.title') }}
        </template>
        
        <template #subtitle>
            {{ $t('profile.settings.changePhone.description') }}
        </template>
        
        <template #form>
            <NIntlPhoneInput
                id="phone-number"
                :label="$t('profile.settings.changePhone.form.mobilePhoneNumber.label')"
                v-model="phone"
                :error="phoneErrorMessage"
                initialSelectedCountryIso="ZA"
                :placeholder="$t('profile.settings.changePhone.form.mobilePhoneNumber.placeholder')"
            />

            <NButton 
                size="lg" 
                variant="primary" 
                class="w-full sm:w-2/4 self-end"
                type="submit"
                :loading="loading"
                :disabled="authStore.isLoading && !loading"
            >
                {{ $t('profile.settings.changePhone.form.submit') }}
            </NButton>
        </template>
    </SettingsSection>
</template>

<script setup lang="ts">
import { z } from 'zod';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/useAuthStore';
import { toTypedSchema } from '@vee-validate/zod';
import { usePreserveRouter } from '@/composables/usePreserveRouter';
import { useField, useForm } from 'vee-validate';
import { NButton, NIntlPhoneInput } from 'nandos-core-ui-v2';
import SettingsSection from './settings-section.vue';

const { t } = useI18n();
const authStore = useAuthStore();
const { router } = usePreserveRouter();

// Form schema
const schema = toTypedSchema(
    z.object({
        phone: z.string()
            .nonempty({ message: t('formValidation.valueMissing', { name: 'New mobile number' }) })
            .regex(/^\+?\d+$/, { message: t('formValidation.phoneNumber', { name: 'New mobile number' }) })
            .min(10, { message:  t('formValidation.shortPhoneNumber', { name: "New mobile number", minlength: 10 }) }),
    }),
);

// Initialize the form
const { handleSubmit } = useForm<{ phone: string }>({
  validationSchema: schema,
  initialValues: {
    phone: '',
  },
});

// Form v-models
const loading = ref(false);
const errorMsg = ref('');
const { value: phone, errorMessage: phoneErrorMessage } = useField<string>('phone');

const updateMobilePhone = handleSubmit(
    async ({phone}) => {
        loading.value = true;
        errorMsg.value = '';
        const phoneChanged = await authStore.changeMobilePhone(phone);
        loading.value = false;

        if (!phoneChanged) {
            if (!authStore.errorCode) errorMsg.value = 'Mobile phone change failed. Please try again.';
            else errorMsg.value = authStore.errorCode;
            return;
        }
        // Success
        // Store new mobile number in local storage until it's verifed
        // Helps when user refreshes the page we still have the new number to send an otp
        localStorage.setItem('verify-phone-change', phone);
        router.push('settings/verify-change-phone');
    }
);
</script>