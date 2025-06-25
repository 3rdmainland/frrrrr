<template>
  <TransitionWrapper>
    <div class="flex flex-col items-center !h-full w-full bg-[#111111]">
      <header
        v-if="!$route.meta.hideHeader"
        class="w-full flex items-center justify-between md:px-8 mt-8"
      >
        <NButton
          v-if="$route.meta.showCancel"
          variant="unstyled"
          class="sm:top-28 md:sticky md:top-12 w-12 h-12 flex items-center justify-center bg-nandos-black hover:invert border-2 rounded-l-lg md:rounded-full"
          @click="$router.back()"
        >
          <NIcon icon="close" size="md" class="cursor-pointer" />
          <span class="sr-only">Cancel</span>
        </NButton>
        <NButton
          v-else
          variant="unstyled"
          class="sm:top-28 md:sticky md:top-12 w-12 h-12 flex items-center pr-[4px] justify-center bg-nandos-black hover:invert border-2 rounded-l-lg md:rounded-full"
          @click="$router.push('/setup')"
        >
          <NIcon icon="arrow-left" size="md" class="cursor-pointer" />
          <span class="sr-only">Back</span>
        </NButton>
        <h1 class="text-2xl md:text-3xl font-bold text-white transform">
          {{ $route.meta.title }}
        </h1>
        <div />
      </header>
      <main
        :class="[
          'w-full p-8 !h-full overflow-y-auto',
          $route.meta.fullWidth ? 'md:w-3/4' : 'w-full',
          { 'no-header': $route.meta.hideHeader },
        ]"
      >
        <TransitionWrapper> <router-view /></TransitionWrapper>
      </main></div
  ></TransitionWrapper>
</template>
<script setup lang="ts">
import { NButton, NIcon } from 'nandos-core-ui-v2'
import TransitionWrapper from '@/components/ui/TransitionWrapper.vue'
</script>
