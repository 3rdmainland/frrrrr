<template>
    <main class="h-full text-nandos-fresh-white flex flex-col gap-12 items-center bg-[#111]">
        <div class="w-4/5 md:w-2/5 space-y-8">
            <div class="flex flex-col items-center gap-6 mt-6">
                <h1 class="text-[24px] sm:text-[30px] md:text-[44px] text-center bg-nandos-black -rotate-[1.5deg] px-4">
                   <slot name="header">Verify</slot>
                </h1>
        
                <p>
                    <slot name="subtitle">Verify</slot>
                </p>
            </div>
    
            <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
                <NInput
                    id="otp"
                    :label="$t('signUp.verify.form.otp.label')"
                    v-model.trim="otp"
                    placeholder="Enter the 4 digit pin"
                    type="number"
                    :error="otpErrorMessage"
                    inputmode="decimal"
                />
    
                <NButton
                    class="self-end rounded-none border-b-1 border-nandos-black-500 hover:border-nandos-fresh-white"
                    size="sm"
                    type="button" 
                    variant="unstyled"
                    @click="getNewOTP"
                >
                    {{ $t('signUp.verify.resendOtpButton') }}
                </NButton>
    
                <NButton
                    class="mt-2"
                    size="lg"
                    type="submit" 
                    variant="primary"
                    :loading="loading"
                >
                    {{ $t('signUp.verify.form.submit') }}
                </NButton>
    
                <!-- Error Alert -->
                <AuthServerErrorAlert :errorCode="authStore.errorCode" @resend-otp="getNewOTP" :customErrorMsg="errorMsg"/>
            </form>
        </div>
    </main>
</template>

<script setup lang="ts">
import { z } from 'zod';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/useAuthStore';
import { toTypedSchema } from '@vee-validate/zod';
import { NInput, NButton } from 'nandos-core-ui-v2';
import { useField, useForm } from 'vee-validate';
import { usePreserveRouter } from '@/composables/usePreserveRouter';
import AuthServerErrorAlert from '@/components/authentication/auth-server-error-alert/auth-server-error-alert.vue';


interface verifyOtpResponse {
    success: boolean;
    redirectPath?: string;
}

const props = defineProps<{
    mobileNumber?: string, // For sign-up this should come from the store, for reset password or mobile no. change this should come from local storage
    submitOtp: (otp: string) => Promise<verifyOtpResponse>
}>();

const { t } = useI18n();
const authStore = useAuthStore();
const { pushToRedirect } = usePreserveRouter();

// Form schema
const schema = toTypedSchema(
  z.object({
    otp: z.string()
          .nonempty(t('signUp.verify.form.otp.missing'))
          .length(4, { message: t('signUp.verify.form.otp.invalidLength') }),
  }),
);

// Initialize form with schema
const { handleSubmit } = useForm<{otp: string}>({
  validationSchema: schema,
  initialValues: {
    otp: '',
  },
});

// Form v-models
const loading = ref(false);
const errorMsg = ref('');
const { value: otp, errorMessage: otpErrorMessage } = useField<string>('otp');
// Auto submit form when OTP is 4 digits
watch(otp, () => {
    if (`${otp.value}`.length === 4) onSubmit();
});

// Verify OTP
const onSubmit = handleSubmit(
    async ({otp}) => {
        errorMsg.value = '';
        loading.value = true;
        const {success, redirectPath = '/'} = await props.submitOtp(otp);
        loading.value = false;

        if (!success) {
            if (!authStore.errorCode) errorMsg.value = "Verification failed. Please try again.";
            return;
        }
        // Success push to redirect if exist or home
        pushToRedirect(redirectPath);
    }
);

// Get new otp
async function getNewOTP() {
    // There should always be a mobile number when entering this page
    // If there is not then the user navigated here purposely 
    if (!props.mobileNumber) {
        errorMsg.value = 'No OTP associated with this mobile number!';
        return;
    }
    
    errorMsg.value = '';
    const isNewOTP = await authStore.resendVerification(props.mobileNumber);
    if (!isNewOTP) {
        if (!authStore.errorCode) errorMsg.value = "OTP resend failed. Please try again.";
        return;
    }
}
</script>