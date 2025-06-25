<template>
  <div class="product-detail-view bg-[#111111] px-4">
    <!-- Header -->
    <NButton
      variant="unstyled"
      class="fixed z-10 top-16 sm:top-28 -left-2 md:sticky md:top-12 w-12 h-12 flex items-center pr-[4px] justify-center bg-nandos-black hover:invert border-2 rounded-l-lg md:rounded-full"
      @click="$router.back()"
    >
      <NIcon icon="arrow-left" size="md" class="cursor-pointer" />
      <span class="sr-only">Back</span>
    </NButton>

    <!-- Loading State -->
    <div v-if="isLoading" class="container mx-auto p-8">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p class="mt-4">Loading product...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container mx-auto p-8">
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p class="font-bold">Error loading product</p>
        <p>{{ error.message }}</p>
      </div>
    </div>

    <!-- Product Configurator -->
    <div v-else-if="product" class="container mx-auto md:p-8">
      <ProductConfigurator :product="product" @add-to-cart="handleAddToCart" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProduct } from 'nandos-middleware-api/src/domain/menu'
import ProductConfigurator from './components/ProductConfigurator.vue'
import { NIcon, NButton } from 'nandos-core-ui-v2'

const route = useRoute()

const productId = route.params.productId as string
const { product, isLoading, error, loadProduct } = useProduct(productId)

function handleAddToCart(data: any) {
  if (product.value) {
    console.log(product.value, data.selections, data.totalPrice)
  }
}

onMounted(() => {
  if (productId) {
    loadProduct(productId)
  }
})
</script>
