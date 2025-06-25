<template>
  <div class="flex flex-col items-center gap-12">
    <ChangePasswordForm v-if="authStore.user && authStore.user.hasPassword"/>
    <ChangeMobileForm/>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore';
import ChangeMobileForm from '@/components/me/settings/change-mobile-form.vue';
import ChangePasswordForm from '@/components/me/settings/change-password-form.vue';

const authStore = useAuthStore();
</script>
