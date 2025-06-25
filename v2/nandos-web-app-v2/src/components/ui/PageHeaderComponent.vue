<template>
  <header
    class="w-full flex items-center justify-between mb-8"
  >
    <NButton
      v-if="$route.meta.showCancel"
      variant="unstyled"
      class="sm:top-28 md:sticky md:top-12 w-12 h-12 flex items-center justify-center bg-nandos-black hover:invert border-2 rounded-l-lg md:rounded-full"
      @click="isOrderSetup ? $router.push('/menu') : $router.push('/')"
    >
      <NIcon icon="arrow-left" size="md" class="cursor-pointer" />
      <span class="sr-only">Cancel</span>
    </NButton>
    <NButton
      v-else
      variant="unstyled"
      class="sm:top-28 md:sticky md:top-12 w-12 h-12 flex items-center pr-[4px] justify-center bg-nandos-black hover:invert border-2 rounded-l-lg md:rounded-full"
      @click="$router.back()"
    >
      <NIcon icon="arrow-left" size="md" class="cursor-pointer" />
      <span class="sr-only">Back</span>
    </NButton>
    <h1 class="text-2xl md:text-3xl font-bold text-white transform">
      {{ $route.meta.title }}
    </h1>
    <div />
  </header>
</template>
<script setup lang="ts">
import { NButton, NIcon } from 'nandos-core-ui-v2'
import { useBasketStoreV2 } from '@/stores/useBasketStoreV2.ts'

const {  isOrderSetup } = useBasketStoreV2()
</script>
