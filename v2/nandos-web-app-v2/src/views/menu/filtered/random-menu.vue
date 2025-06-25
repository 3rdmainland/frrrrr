<template>
  <div v-if="isLoading" class="p-4 sm:p-12 flex flex-col items-center justify-center">
    <div class="animate-spin mb-4">
      <svg class="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962
             0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
    <div class="text-xl text-white">Discovering something delicious for you...</div>
  </div>

  <div v-else-if="error" class="p-4 sm:p-12 flex flex-col items-center justify-center">
    <div class="text-red-600 mb-4">
      <svg
        class="w-12 h-12"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54
             0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333
             -3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
    <div class="text-xl text-red-600 mb-2">Error</div>
    <div class="text-gray-600">{{ error }}</div>
    <button
      @click="router.push('/menu')"
      class="mt-4 bg-red-600 text-white px-4 py-2 rounded-md"
    >
      Back to Menu
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStoreV2 } from '@/stores/useMenuStoreV2'

const router = useRouter()
const menuStore = useMenuStoreV2()
const isLoading = ref(true)
const error = ref(null)

const navigateToRandomProduct = async () => {
  isLoading.value = true
  error.value = null

  try {
    const randomProduct = await menuStore.getSingleRandomProduct()

    if (!randomProduct) {
      throw new Error('Could not find a random product')
    }

    // Navigate to the product detail page with the random product's ID
    router.push({
      name: 'ProductDetail',
      params: { productId: randomProduct.idPath }
    })
  } catch (err) {
    error.value = err.message || 'Failed to load a random product'
    console.error('Failed to navigate to random product:', err)
    isLoading.value = false
  }
}

onMounted(navigateToRandomProduct)
</script>
