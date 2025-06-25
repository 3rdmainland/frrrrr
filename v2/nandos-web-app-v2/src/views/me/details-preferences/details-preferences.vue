<template>
  <div class="flex flex-col bg-[#111111] h-full items-center">

    <form class="w-full md:w-3/5 lg:w-2/5 flex flex-col space-y-4 mt-4" @submit.prevent="updateInfo">        
      <NInput 
        id="firstName" 
        :label="$t('profile.info.form.name')" 
        v-model="firstName" 
        :error="firstNameErrorMessage" 
        type="text"
      />
      <NInput 
        id="surname" 
        :label="$t('profile.info.form.lastName')" 
        v-model="surname" 
        :error="surnameErrorMessage" 
        type="text"
      />
      <NInput 
        id="email" 
        :label="$t('profile.info.form.email')" 
        v-model="email" 
        :error="emailErrorMessage" 
        type="text"
      />
      
      <fieldset>
        <legend class="text-nandos-fresh-white mb-2">{{ $t('profile.info.form.birthday.label') }}</legend>
        <div class="flex flex-wrap justify-between w-full gap-2">
          <NSelect 
            id="birthDay"
            v-model="day" 
            :label="$t('profile.info.form.birthday.day')"
            class="flex-1 min-w-20"
          >
            <option disabled>{{ $t('profile.info.form.birthday.day') }}</option>
            <option v-for="day in 31" :key="day" :value="padDateNumber(day)">{{ day }}</option>
          </NSelect>
  
          <NSelect
            id="birthMonth"
            v-model="birthMonth" 
            :label="$t('profile.info.form.birthday.month')"
            class="flex-1 min-w-34"
          >
            <option disabled>{{ $t('profile.info.form.birthday.month') }}</option>
            <option v-for="(month, idx) in MONTHS" :key="month" :value="padDateNumber(idx)">{{ month }}</option>
          </NSelect>
  
          <NSelect 
            id="birthYear" 
            v-model="birthYear" 
            :label="$t('profile.info.form.birthday.year')"
            class="flex-1 min-w-20"
          >
            <option disabled>{{ $t('profile.info.form.birthday.year') }}</option>
            <option v-for="year in 90" :value="firstBirthYear - year" :key="firstBirthYear - year">{{firstBirthYear - year}}</option>
          </NSelect>
        </div>
      </fieldset>

      <NSelect id="preferredFlavour" v-model="preferredFlavour" :label="$t('profile.info.form.preference.flavour.label')">
        <option value="">{{ $t('profile.info.form.preference.flavour.none') }}</option>
        <option v-for="(flavourName, flavourId) in globalConfigStore.flavours" :value="flavourId" :key="flavourId">{{flavourName}}</option>
      </NSelect>

      <NButton
        type="submit"
        size="lg" 
        variant="primary"
        class="w-full md:w-2/5 self-center md:self-end mb-0"
        :loading="loading"
      >
        {{ $t('profile.info.form.submit') }}
      </NButton>
      <p class="text-red-500 w-full mt-4">
        {{ errorMsg }}
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';
import { useRouter } from 'vue-router';
import { cloneDeep } from 'lodash-es';
import { ICustomer } from 'nandos-types';
import { useAuthStore } from '@/stores/useAuthStore';
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { computed, ref, watch } from 'vue';
import { useGlobalConfigStore } from '@/stores/useGlobalConfig';
import { NInput, NSelect, NButton } from 'nandos-core-ui-v2';
import { formatDate, isValdDate, MONTHS, padDateNumber } from '@/utils/date-utils';
import CustomerService from 'nandos-middleware-api/src/service/customer/me-service.ts'

const authStore = useAuthStore();
const globalConfigStore = useGlobalConfigStore();
const router = useRouter();

// Form Zod schema
const schema = toTypedSchema(
  z.object({
    firstName: z.string().min(1, "First name is required"),
    surname: z.string().min(1, "Surname is required"),
    email: z.string().email("Email must be a valid email address").optional().or(z.literal(''))
  }),
);

// Intitalize form
const { handleSubmit } = useForm<{ firstName: string; surname: string; email: string }>({
  validationSchema: schema,
  initialValues: {
    firstName: authStore.user?.name || '',
    surname: authStore.user?.lastName || '',
    email: authStore.user?.email || '',
  },
});

// form model values
const loading = ref(false);
const errorMsg = ref('');
const user = ref<ICustomer>(cloneDeep(authStore.user)!); // User must be availble to access this page hence !
const { value: firstName, errorMessage: firstNameErrorMessage} = useField<string>('firstName');
const { value: surname, errorMessage: surnameErrorMessage} = useField<string>('surname');
const { value: email, errorMessage: emailErrorMessage} = useField<string>('email');
// Birthday
const day = ref("");
const birthMonth = ref("");
const firstBirthYear = new Date().getFullYear() - 10;
const birthYear = ref("");
const birthday = computed(() => {
  // All must be selected otherwise it's not a valid date
  if (!birthYear.value || !birthMonth.value || !day.value) return null;
  const date = new Date(`${birthYear.value}-${parseInt(birthMonth.value) + 1}-${day.value}`)
  return isValdDate(date) ? date : null;
});
// Set user birthday in user obj if valid
watch(birthday, () => {
  if (!birthday.value) {
    // Reset it back to what it was
    user.value.birthday = authStore.user?.birthday;
    return;
  }
  // valid date update user
  user.value.birthday = formatDate(birthday.value);
});

// Preference
const preferredFlavour = ref("");

// Set initial model values on component create
(function setInitialModelValues() {
  if (authStore.user?.birthday)  {
    const [d, m, y] = authStore.user.birthday.split('/');
    day.value = d;
    birthMonth.value = padDateNumber(parseInt(m) - 1); // -1 cause MONTHS index from 0
    birthYear.value = y;
  }

  if (authStore.user?.preferences.flavour) {
    preferredFlavour.value = authStore.user.preferences.flavour;
  }
})();

// form submit
const updateInfo = handleSubmit(
  async ({firstName, surname, email}) => {
    loading.value = true;
    errorMsg.value = "";
    user.value.name = firstName;
    user.value.lastName = surname;
    user.value.email = email;
    user.value.preferences.flavour = preferredFlavour.value;
    // Update user info
    try {
      await CustomerService.updateCustomer(user.value);
      router.push('/me');
    } catch (error) {
      if (error instanceof Error) errorMsg.value = error.message;
      else errorMsg.value = "Update failed. Please try again."
    } finally {
      loading.value = false;
    }
  },
);
</script>
