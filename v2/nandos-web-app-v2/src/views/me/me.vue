<template>
  <div class="min-h-full p-4 sm:p-12 flex flex-col items-center bg-[#111]">

    <main v-if="$route.path === '/me'" class="w-full flex-1 md:w-3/5 space-y-4">
      <h2 class="text-[30px] lg:text-[36px] text-nandos-fresh-white mb-6 mx-6">
        Howzit {{ authStore.user.name }}
      </h2>

      <RouterLink
        v-for="item in menuItems"
        :key="item.title"
        :to="item.to"
        class="block cursor-pointer"
      >
        <NProfileCard :title="item.title" :subtitle="item.subtitle"/>
      </RouterLink>

      <div class="flex flex-col flex-col-reverse md:flex-row justify-between gap-4 mt-8">
        <NButton class="text-nandos-peri-red-500 border-solid border-2 hover:border-transparent d:ml-4" size="lg">
          Delete account
        </NButton>
        <NButton type="submit" raised size="lg" variant="primary" class="w-full md:w-1/5" @click="authStore.logout">
          Logout
        </NButton>
      </div>
    </main>

    <main v-else class="relative w-full flex-1 flex">
      <NButton 
        variant="unstyled" 
        class="
          fixed z-10 top-16 sm:top-28 -left-2 md:sticky md:top-12 w-12 h-12 flex items-center pr-[4px]
          justify-center bg-nandos-black hover:invert border-2 rounded-l-lg md:rounded-full
        "
        @click="$router.back()"
      >
        <NIcon
          icon="arrow-left"
          size="md"
          class="cursor-pointer"
        />
        <span class="sr-only">Back</span>
      </NButton>

      <div class="flex-1 md:-ml-12 space-y-4">
        <h1 class="text-2xl md:text-[36px] font-medium text-nandos-fresh-white text-center">{{ currentTitle }}</h1>
        <RouterView></RouterView>
      </div>
    </main>

  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore.js'
import { NButton, NProfileCard, NIcon } from 'nandos-core-ui-v2'
import { computed } from 'vue'

const authStore = useAuthStore();
const router = useRouter()

// Compute the current route name for the header
const currentTitle = computed(() => {
  const path = router.currentRoute.value.path
  const match = menuItems.find((item) => item.to === path)
  return match ? match.title : ''
})

const menuItems = [
  { title: 'My Order History', subtitle: 'View recent purchase', to: '/me/order-history' },
  {
    title: 'My Gift Card Wallet',
    subtitle: 'Gift Card associated with your account',
    to: '/me/gift-cards',
  },
  {
    title: 'My Details & Preferences',
    subtitle: 'Lets get to know you',
    to: '/me/details-preferences',
  },
  { title: 'My Addresses', subtitle: 'Saved delivery addresses', to: '/me/addresses' },
  { title: 'My Account Settings', subtitle: 'Password and mobile number', to: '/me/settings' },
  {
    title: 'My Credit Cards',
    subtitle: 'Saved credit cards for quick payment',
    to: '/me/credit-cards',
  },
]
</script>
