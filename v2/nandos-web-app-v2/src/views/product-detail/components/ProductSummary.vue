<template>
  <div class="product-summary">
    <div class="relative">
      <NTile :bgImage="product.getImageCollection()?.images?.[0]?.path || '/placeholder.jpg'" />
    </div>
    <h1 class="bottom-4 left-4 text-3xl font-bold py-2 rounded">
      {{ product.name || product.getName?.() }}
    </h1>

    <p class="mt-4 text-gray-600">
      {{ product.description || product.getDescription?.() }}
    </p>
    <p class="mt-6 text-2xl font-bold">
      {{ formatCurrency(product.computePrice() ?? 0, defaultLocale) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from 'nandos-i18n-v2'
import { NTile } from 'nandos-core-ui-v2'
import { useGlobalConfigStore } from '@/stores/useGlobalConfig.ts'
const { defaultLocale } = useGlobalConfigStore()

defineProps<{
  product: any
  totalPrice?: number
}>()
</script>
