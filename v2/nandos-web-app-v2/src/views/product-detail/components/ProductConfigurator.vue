<template>
  <div class="product-configurator h-full">
    <!-- Main Product Info -->
    <div
      class="flex flex-col md:flex-row gap-10 md:h-[calc(100vh-240px)] items-start justify-center"
    >
      <!-- Left: Product Summary -->
      <div class="md:w-1/3 overflow-auto">
        <ProductSummary :product="product" :totalPrice="totalPrice" />
      </div>

      <!-- Right: Configuration Options -->
      <div class="w-full md:w-2/6 space-y-4 h-full">
        <div class="space-y-4 max-h-[80%] overflow-auto rounded-b-2xl">
          <ConfigurationRenderer :product="product" @update:selections="handleSelections" />
        </div>
        <!-- Quantity Selector -->
        <div class="flex justify-center items-center gap-4 p-4 rounded-lg">
          <div class="flex items-center gap-2">
            <NButton
              rounded
              @click="quantity = Math.max(1, quantity - 1)"
              class="w-8 h-8 rounded-full bg-black border border-nandos-fresh-white hover:bg-gray-100 flex items-center justify-center"
            >
              <NIcon size="sm" icon="minus" />
            </NButton>
            <span class="w-12 text-2xl text-center text-white">{{ quantity }}</span>
            <NButton
              rounded
              @click="quantity++"
              class="w-8 h-8 rounded-full bg-black border border-nandos-fresh-white hover:bg-gray-100 flex items-center justify-center"
            >
              <NIcon size="sm" icon="plus" />
            </NButton>
          </div>
          <span class="w-12 text-2xl text-center text-white">{{
            formatToCurrency(totalPrice * quantity)
          }}</span>
        </div>

        <!-- Add to Cart -->
        <NButton
          :disabled="!isComplete || isAddingToCart"
          @click="addToCart"
          :loading="isAddingToCart"
          size="lg"
          variant="primary"
          class="w-full"
        >
          <span v-if="isAddingToCart" class="flex items-center justify-center">
            Adding to Cart...
          </span>
          <span v-else> Add to Cart </span>
        </NButton>

        <!-- Error message -->
        <div v-if="addToCartError" class="mt-2 text-red-600 text-sm text-center">
          {{ addToCartError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductConfiguration } from '../composables/useProductConfiguration'
import { useBasketStoreV2 } from '@/stores/useBasketStoreV2.ts'
import { useAuthStore } from '@/stores/useAuthStore.ts'
import ProductSummary from './ProductSummary.vue'
import ConfigurationRenderer from './ConfigurationRenderer.vue'
import UserProduct from 'nandos-middleware-api/src/model/user-product.ts'
import { NButton, NIcon } from 'nandos-core-ui-v2'
import formatToCurrency from '@/utils/formatToCurrency.ts'

const props = defineProps<{
  product: UserProduct
}>()

const router = useRouter()
const basketStore = useBasketStoreV2()
const authStore = useAuthStore()

const { selections, isComplete, totalPrice, updateSelection } = useProductConfiguration(
  ref(props.product),
)

const quantity = ref(1)
const isAddingToCart = ref(false)
const addToCartError = ref('')
const showSuccess = ref(false)

function handleSelections(newSelections: Record<string, any>) {
  Object.entries(newSelections).forEach(([key, value]) => {
    updateSelection(key, value)
  })
}

async function addToCart() {
  if (!isComplete.value) return

  isAddingToCart.value = true
  addToCartError.value = ''
  showSuccess.value = false

  try {
    props.product.orderQuantity = quantity.value
    await basketStore.addItem(props.product)
    showSuccess.value = true
    await router.push('/menu')
  } catch (error: any) {
    console.error('Failed to add to cart:', error)
    addToCartError.value = error.message || 'Failed to add item to cart. Please try again.'
  } finally {
    isAddingToCart.value = false
  }
}

watch(
  selections,
  () => {
    addToCartError.value = ''
    showSuccess.value = false
  },
  { deep: true },
)
</script>
