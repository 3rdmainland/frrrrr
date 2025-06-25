<template>
  <Header />

  <div class="flex-1 overflow-y-auto">
    <TransitionWrapper>
      <router-view />
    </TransitionWrapper>
  </div>

  <!-- Mobile Nav -->
  <nav class="h-16 sm:hidden flex justify-around items-center">
    <RouterLink
      v-for="item in navLinks"
      :key="item.label"
      :to="item.to"
      class="flex flex-col items-center"
    >
      <NIcon :icon="item.icon" size="md" />
      <span class="text-xs text-nandos-fresh-white">{{ item.label }}</span>
    </RouterLink>
  </nav>
  <LoadingOverlay />
</template>

<script setup lang="ts">
import Header from '@/components/header/header.vue'
import { NIcon } from 'nandos-core-ui-v2'
import LoadingOverlay from '@/components/loading/loading-overlay.vue'
import TransitionWrapper from '@/components/ui/TransitionWrapper.vue'

const navLinks = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/menu', icon: 'barci', label: 'Menu' },
  { to: '/basket', icon: 'cart', label: 'Basket' },
  { to: '/me', icon: 'account', label: 'Account' },
  { to: '/more', icon: 'more', label: 'More' },
]
</script>
