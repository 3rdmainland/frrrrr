<template>
    <BaseAuthForm :customErrorMsg="errorMsg">
        <template #header>
            {{ $t('signUp.titleShort') }}
        </template>

        <template #form>
            <form class="space-y-4" @submit.prevent="onSubmit">
                <NInput
                  id="first-name"
                  :label="$t('signUp.form.name.label')"
                  v-model.trim="name"
                  placeholder="Enter your first name"
                  type="text"
                  :error="firstNameErrorMessage"
                />
        
                <NInput
                  id="last-name"
                  :label="$t('signUp.form.lastName.label')"
                  v-model.trim="lastName"
                  placeholder="Enter your last name"
                  type="text"
                  :error="lastNameErrorMessage"
                />
    
                <NIntlPhoneInput
                    id="phone-number"
                    :label="$t('signUp.form.mobilePhoneNumber.label')"
                    v-model="mobilePhoneNumber"
                    initialSelectedCountryIso="ZA"
                    :placeholder="$t('signUp.form.mobilePhoneNumber.placeholder')"
                    :error="phoneErrorMessage"
                />
    
                <NInput
                    id="password"
                    :label="$t('signUp.form.password.label')"
                    v-model.trim="password"
                    :placeholder="$t('signUp.form.password.placeholder')"
                    type="password"
                    :error="passwordErrorMessage"
                />
        
                <NCheckbox
                    id="marketing-opt-in"
                    name="marketing-opt-in" 
                    class="text-nandos-fresh-white"
                    labelClasses="text-sm cursor-pointer w-[fit-content]"
                    v-model="marketingOptIn" 
                    :label="$t('signUp.form.marketing.label')"
                />
    
                <NButton
                    class="w-full"
                    type="submit" 
                    size="lg" 
                    variant="primary"
                    :loading="loading"
                >
                    {{ $t('signUp.form.submit') }}
                </NButton>
            </form>
        </template>

        <template #usage>signing up</template>

        <template #footer>
            <span class="text-lg">{{ $t('signUp.signInPrompt') }}</span>
            <NButton 
                type="button" 
                variant="secondary" 
                class="py-3"
                @click="pushRoute('/sign-in')"
            >
                {{ $t('signUp.signIn') }}
            </NButton>
        </template>
    </BaseAuthForm>
</template>

<script setup lang="ts">
import { z } from 'zod';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/useAuthStore';
import { toTypedSchema } from '@vee-validate/zod';
import { usePreserveRouter } from '@/composables/usePreserveRouter';
import { useField, useForm } from 'vee-validate';
import { NInput, NIntlPhoneInput, NCheckbox, NButton } from 'nandos-core-ui-v2';
import BaseAuthForm from '@/components/authentication/base-auth-form.vue';

const { t } = useI18n();
const { pushRoute } = usePreserveRouter();
const authStore = useAuthStore();

// Form schema
const schema = toTypedSchema(
  z.object({
    name: z.string().min(1, { message: t('signUp.form.name.errors.missing') }),
    lastName: z.string().min(1, { message: t('signUp.form.lastName.errors.missing') }),
    mobilePhoneNumber: z.string()
            .regex(/^\+?\d+$/, { message: t('signUp.form.mobilePhoneNumber.errors.invalid') })
            .min(10, { message: t('signUp.form.mobilePhoneNumber.errors.missing') }),
    password: z.string()
               .nonempty(t('signUp.form.password.errors.missing'))
               .min(6, { message: t('signUp.form.password.errors.short') }),
  }),
);

type TSignUpForm = {
    name: string;
    lastName: string;
    mobilePhoneNumber: string;
    password: string;
};

// Initialize form with schema
const { handleSubmit } = useForm<TSignUpForm>({
  validationSchema: schema,
  initialValues: {
    name: '',
    lastName: '',
    mobilePhoneNumber: '',
    password: '',
  },
});

// Form v-models
const loading = ref(false);
const errorMsg = ref('');
const { value: name, errorMessage: firstNameErrorMessage } = useField<string>('name');
const { value: lastName, errorMessage: lastNameErrorMessage } = useField<string>('lastName');
const { value: mobilePhoneNumber, errorMessage: phoneErrorMessage } = useField<string>('mobilePhoneNumber');
const { value: password, errorMessage: passwordErrorMessage } = useField<string>('password');
const marketingOptIn = ref(false);

// Sign up
const onSubmit = handleSubmit(
    async (values) => {
        loading.value = true;
        const registeredSuccessfully = await authStore.register({ ...values, marketingOptIn: marketingOptIn.value });
        loading.value = false;
        
        // If there's no error code and we didn't register then something else went wrong
        if (!registeredSuccessfully) {
            if (!authStore.errorCode) errorMsg.value = 'Sign up failed. Please try again.';
            return;
        }
        // Success push to verify account
        pushRoute('sign-up/verify');
    }
)
</script>