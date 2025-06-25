<template>
    <section class="w-full  md:w-3/5 lg:w-2/5 text-nandos-fresh-white">
        <h2 class="text-[22px]"> 
            <slot name="header"></slot> 
        </h2>
        
        <p class="mb-4">
            <slot name="subtitle"></slot>
        </p>

        <form class="flex flex-col gap-4" @submit.prevent="submitFn">
            <slot name="form"></slot>            
        </form>

        <!-- Error Alert -->
        <NAlert v-model="alertVisible" @update:model-value="(val) => alertVisible = val" variant="error" class="mt-4">
            <p>
                <template v-if="errorMsg === AUTH_ERROR_CODE.INVALID_CREDENTIALS">
                    {{ $t('profile.settings.errors.invalidCredentials') }}
                </template>

                <template v-else-if="errorMsg === AUTH_ERROR_CODE.DUPLICATE_CREDENTIALS">
                    {{ $t('profile.settings.errors.duplicateCredentials') }}
                </template>

                <template v-else-if="errorMsg === AUTH_ERROR_CODE.INVALID_MOBILE_PHONE_NUMBER">
                    {{ $t('profile.settings.errors.invalidMobileNumber') }}
                </template>

                <template v-else>
                    {{ errorMsg }}
                </template>
            </p>
        </NAlert>
    </section>
</template>

<script setup lang="ts">
import { NAlert } from 'nandos-core-ui-v2';
import { AUTH_ERROR_CODE } from 'nandos-types';
import { ref, watch } from 'vue';

const props = defineProps<{
    submitFn: () => void,
    errorMsg: string
}>();

// Auto show/hide alert 
const alertVisible = ref(false);
watch(() => props.errorMsg, (errorMsg) => {
    if (!errorMsg) alertVisible.value = false;
    else alertVisible.value = true;
});
</script>