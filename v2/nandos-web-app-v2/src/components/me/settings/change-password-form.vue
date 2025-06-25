<template>
    <SettingsSection :submit-fn="updatePassword" :error-msg="errorMsg">
        <template #header>
            <h2>{{ $t('profile.settings.changePassword.title') }}</h2>
        </template>

        <template #form>
            <NInput
                type="password"
                id="password-old"
                v-model="passwordOld"
                autocomplete="current-password"
                :error="passwordOldErrorMessage"
                :label="$t('profile.settings.changePassword.form.currentPassword.label')"
                :placeholder="$t('profile.settings.changePassword.form.currentPassword.placeholder')"
            />

            <NInput
                type="password"
                id="password-new"
                v-model="passwordNew"
                autocomplete="new-password"
                :error="passwordNewErrorMessage"
                :label="$t('profile.settings.changePassword.form.newPassword.label')"
                :placeholder="$t('profile.settings.changePassword.form.newPassword.placeholder')"
            />

            <NButton
                size="lg" 
                variant="primary" 
                class="w-full sm:w-2/4 self-end"
                type="submit"
                :loading="loading"
                :disabled="authStore.isLoading && !loading"
            >
                {{ $t('profile.settings.changePassword.form.submit') }}
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
import { NButton, NInput } from 'nandos-core-ui-v2';
import { usePreserveRouter } from '@/composables/usePreserveRouter';
import { useField, useForm } from 'vee-validate';
import SettingsSection from './settings-section.vue';

const { t } = useI18n();
const authStore = useAuthStore();
const { pushToRedirect } = usePreserveRouter();

// Form schema
const minPasswordLength = 6;
const schema = toTypedSchema(
    z.object({
        passwordOld: z.string()
                    .nonempty({ message: t('formValidation.valueMissing', { name: 'Old Password' }) })
                    .min(minPasswordLength, { message:  t('formValidation.tooShort', { name: "Old Password", minlength: minPasswordLength }) }),
        passwordNew: z.string()
                    .nonempty({ message: t('formValidation.valueMissing', { name: 'New Password' }) })
                    .min(minPasswordLength, { message:  t('formValidation.tooShort', { name: "New Password", minlength: minPasswordLength }) }),
    }),
);

// Initialize the form
const { handleSubmit } = useForm<{ passwordOld: string; passwordNew: string }>({
    validationSchema: schema,
    initialValues: {
        passwordOld: '',
        passwordNew: '',
    },
});

// Form v-models
const loading = ref(false);
const errorMsg = ref('');
const { value: passwordOld, errorMessage: passwordOldErrorMessage } = useField<string>('passwordOld');
const { value: passwordNew, errorMessage: passwordNewErrorMessage } = useField<string>('passwordNew');

const updatePassword = handleSubmit(
    async ({passwordOld, passwordNew}) => {
        loading.value = true;
        errorMsg.value = '';
        const passwordChanged = await authStore.changePassword(passwordOld, passwordNew);
        loading.value = false;

        if (!passwordChanged) {
            if (!authStore.errorCode) errorMsg.value = 'Password change failed. Please try again.';
            else errorMsg.value = authStore.errorCode;
            return;
        }
        // Success
        pushToRedirect('/me');
    }
);
</script>