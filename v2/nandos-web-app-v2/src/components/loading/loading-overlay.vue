<template>
  <Transition name="fade">
    <div v-if="isLoading" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <NSpinner class="w-12 h-12 text-nandos-red" />
        <p v-if="loadingMessage" class="mt-4 text-nandos-black">{{ loadingMessage }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { NSpinner } from 'nandos-core-ui-v2'
import { useUIStore } from '@/stores/useUIStore'
import { storeToRefs } from 'pinia'

const uiStore = useUIStore()
const { isLoading, loadingMessage } = storeToRefs(uiStore)
</script>
