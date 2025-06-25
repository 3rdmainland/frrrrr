<template>
  <BaseAuthForm :customErrorMsg="errorMessage">
    <template #header>
      {{ $t('signIn.titleShort') }}
    </template>

    <template #form>
      <form class="flex flex-col space-y-4" @submit.prevent="onSubmit">
        <NIntlPhoneInput
          id="phone-number"
          :label="$t('signIn.form.mobilePhoneNumber.label')"
          v-model="phone"
          :error="phoneErrorMessage"
          initialSelectedCountryIso="ZA"
          :placeholder="$t('signIn.form.mobilePhoneNumber.placeholder')"
        />

        <NInput
          id="password"
          :label="$t('signIn.form.password.label')"
          v-model="password"
          :error="passwordErrorMessage"
          :placeholder="$t('signIn.form.password.placeholder')"
          type="password"
        />

        <RouterLink
          :to="preserveTo('/sign-in/password-reset')"
          class="text-nandos-fresh-white self-end border-b-1 hover:border-color-transparent"
        >
          {{ $t('signIn.form.forgotPassword') }}
        </RouterLink>

        <NButton
          type="submit"
          raised
          size="lg"
          :stacked="false"
          variant="primary"
          class="w-full my-4"
          :loading="loading"
        >
          {{ $t('signIn.form.submit') }}
        </NButton>
      </form>
    </template>

    <template #usage>using this site</template>

    <template #footer>
      <span class="text-lg">{{ $t('signIn.signUpPrompt') }}</span>
      <NButton type="button" variant="secondary" class="py-3" @click="pushRoute('/sign-up')">
        {{ $t('signIn.signUp') }}
      </NButton>
    </template>
  </BaseAuthForm>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/useAuthStore.ts'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, useField } from 'vee-validate'
import { usePreserveRouter } from '@/composables/usePreserveRouter'
import { NInput, NIntlPhoneInput, NButton } from 'nandos-core-ui-v2'
import { RouterLink } from 'vue-router'
import BaseAuthForm from '@/components/authentication/base-auth-form.vue'
import AuthService from 'nandos-middleware-api/src/service/auth-service.ts'

const { t } = useI18n()
const { pushRoute, pushToRedirect, preserveTo } = usePreserveRouter()
const authStore = useAuthStore()
const loading = ref(false)
const errorMessage = ref('')

const schema = toTypedSchema(
  z.object({
    phone: z
      .string()
      .nonempty({ message: t('signIn.form.mobilePhoneNumber.errors.missing') })
      .regex(/^\+?\d+$/, { message: t('signIn.form.mobilePhoneNumber.errors.invalid') })
      .min(10, { message: t('signIn.form.mobilePhoneNumber.errors.missing') }),
    password: z
      .string()
      .nonempty({ message: t('signIn.form.password.errors.missing') })
      .min(6, { message: t('signIn.form.password.errors.short') }),
  }),
)

const { handleSubmit } = useForm<{ phone: string; password: string }>({
  validationSchema: schema,
  initialValues: {
    phone: '',
    password: '',
  },
})

const { value: phone, errorMessage: phoneErrorMessage } = useField<string>('phone')
const { value: password, errorMessage: passwordErrorMessage } = useField<string>('password')

const onSubmit = handleSubmit(async ({ phone, password }) => {
  loading.value = true
  await authStore
    .loginWithMobile(phone, password)
    .then((loggedIn) => {
      if (!loggedIn) {
        errorMessage.value = 'Invalid credentials. Please try again.'
      } else {
        pushToRedirect('/')
      }
    })
    .finally(() => {
      loading.value = false
    })
})
</script>
