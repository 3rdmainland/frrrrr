<!-- Header.vue -->
<template>
  <div class="flex flex-col">
    <div
      class="w-full px-8 flex justify-center items-center sm:justify-between h-14 sm:h-18 z-50 top-0 left-0 right-0 bg-black"
      :class="$attrs.class"
    >
      <!-- Logo -->
      <router-link to="/" class="inline-block">
        <img src="@/assets/img/nandos-logo.svg" alt="Nando's South Africa Logo" />
      </router-link>

      <!-- First nav: brochure links -->
      <nav class="flex gap-6 hidden md:flex">
        <div v-for="item in brochureNav" :key="item.title" class="relative group">
          <!-- Main brochure link -->
          <router-link
            :to="item.isExternal ? item.path : item.internalPath || item.path"
            :target="item.isExternal ? '_blank' : ''"
            class="flex flex-col items-center justify-center text-nandos-fresh-white"
          >
            <span class="text-lg">{{ item.title }}</span>
          </router-link>

          <!-- Dropdown if children exist -->
          <div
            v-if="item.children && item.children.length"
            class="absolute hidden group-hover:block bg-white shadow-lg rounded-md p-4 z-10"
          >
            <router-link
              v-for="child in item.children"
              :key="child.title"
              :to="child.isExternal ? child.path : child.internalPath || child.path"
              :target="child.isExternal ? '_blank' : ''"
              class="block py-2 text-black hover:text-gray-600"
            >
              {{ child.title }}
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Second nav: location, FAQ, cart (with badge), account -->
      <nav class="flex gap-6 hidden md:flex">
        <router-link
          v-for="item in navItems"
          :key="item.labelKey"
          :to="item.to"
          class="flex flex-col items-center justify-center text-nandos-fresh-white"
        >
          <!-- Non-cart icons -->
          <template v-if="item.icon !== 'cart'">
            <NIcon :icon="item.icon" size="md" />
            <span class="font-bold text-sm">{{ $t(item.labelKey) }}</span>
          </template>

          <!-- Cart icon with badge -->
          <template v-else>
            <div class="relative">
              <NIcon :icon="item.icon" size="md" />

              <!-- Red badge only if there are items in the basket -->
              <span
                v-if="basketStore.totalItems > 0"
                class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
              >
                {{ basketStore.totalItems }}
              </span>
            </div>
            <span class="font-bold text-sm">{{ $t(item.labelKey) }}</span>
          </template>
        </router-link>
      </nav>
    </div>
    <SubHeader />
    <NAlert
      :model-value="show"
      @update:modelValue="closeAlert"
      :variant="variant"
      :title="title"
      :subtext="subtext"
      :dismissable="dismissable"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import NavigationService from 'nandos-middleware-api/src/service/navigation-service.ts'
import { NAlert, NIcon } from 'nandos-core-ui-v2'
import SubHeader from '@/components/header/sub-header.vue'
import { useBasketStoreV2 } from '@/stores/useBasketStoreV2.ts'
import { useGlobalAlert } from '@/composables/useGlobalShowAlert.ts'

const { show, variant, title, subtext, dismissable, closeAlert } = useGlobalAlert()

const { isAuthenticated } = useAuthStore()
const basketStore = useBasketStoreV2()

interface BrochureNavItem {
  title: string
  path: string
  internalPath?: string
  isExternal?: boolean
  children?: Array<{
    title: string
    path: string
    internalPath?: string
    isExternal?: boolean
  }>
}
const brochureNav = ref<BrochureNavItem[]>([])

// Fetch brochure links once
const getBrochureLink = () => {
  NavigationService.getBrochureNav().then((res) => {
    brochureNav.value = res
  })
}
getBrochureLink()

// Second navigation items
interface NavItem {
  icon: string
  labelKey: string
  to: string
}
const navItems: NavItem[] = [
  { icon: 'location', labelKey: 'nav.findUs', to: '/find-us' },
  { icon: 'faq', labelKey: 'nav.faq', to: '/faq' },
  { icon: 'cart', labelKey: 'nav.cart', to: '/basket' },
  {
    icon: 'account',
    labelKey: 'nav.account',
    to: isAuthenticated ? '/me' : '/sign-in',
  },
]
</script>
