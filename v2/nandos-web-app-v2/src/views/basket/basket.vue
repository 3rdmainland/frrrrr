<template>
  <div class="bg-[#111111] py-4 sm:py-12 min-h-screen min-w-screen flex flex-col items-center">
    <PageHeaderComponent />
    <div class="flex flex-col items-center justify-start w-full md:w-3/5 lg:w-2/5 space-y-8 px-6">
      <RouterLink to="/" class="block cursor-pointer w-full">
        <NProfileCard
          title="Delivery"
          :subtitle="
            basket?.deliveryAddress ?? '28 Mirabel street, Suburb, City, Province, Postal code.'
          "
        />
      </RouterLink>

      <h1 class="self-start text-white">Order Summary</h1>

      <!-- Loading State -->
      <div v-if="isLoading && !basket" class="flex justify-center items-center w-full py-8">
        <div class="text-white">Loading your basket...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error && !basket" class="flex flex-col items-center w-full py-8">
        <div class="text-red-400 mb-4">Failed to load basket</div>
        <NButton @click="refreshBasket" variant="secondary" class="bg-nandos-warm-red-400">
          Try Again
        </NButton>
      </div>

      <!-- Empty Basket State -->
      <div
        v-else-if="!basket || !basket.items || basket.items.length === 0"
        class="flex flex-col items-center w-full py-8"
      >
        <div class="text-white mb-4">Your basket is empty</div>
        <RouterLink to="/menu">
          <NButton variant="secondary" class="bg-nandos-warm-red-400"> Start Shopping </NButton>
        </RouterLink>
      </div>

      <!-- Basket Items -->
      <div v-else class="flex flex-col items-start md:items-center w-full">
        <div class="w-full">
          <div class="flex mb-5 relative" v-for="item in basket.items" :key="item.id || item.title">
            <div
              class="bg-[#EEE3DF] w-full rounded-l-3xl flex flex-col items-start justify-between p-6"
            >
              <b class="text-sm">{{ item.productName }}</b>
              <p class="text-xs !text-black">Your flavour: {{ item.computedDescription }}</p>
              <div class="flex justify-between w-full">
                <div class="flex justify-between w-2/4 md:w-1/4">
                  <NButton
                    class="bg-nandos-black h-[32px] w-[32px] border border-white border-2"
                    size="xs"
                    variant="secondary"
                    @click="decreaseQuantity(item)"
                    :disabled="isLoading"
                  >
                    <NIcon icon="minus" size="sm" />
                  </NButton>
                  <span class="font-bold mx-2 flex flex-col items-center justify-center">
                    {{ item.quantity }}
                  </span>
                  <NButton
                    class="bg-nandos-black h-[32px] w-[32px] border border-white border-2"
                    size="xs"
                    variant="secondary"
                    @click="increaseQuantity(item)"
                    :disabled="isLoading"
                  >
                    <NIcon icon="plus" size="sm" />
                  </NButton>
                </div>
                <NTextHighlight el="p" highlight size="lg" class="flex items-center text-md">
                  {{ formatCurrency(Math.imul(item.productPrice, item.quantity), locale) }}
                </NTextHighlight>
              </div>
            </div>
            <NTile class="!h-[144px] !w-[144px] rounded-l-none" :bgImage="item.image?.path" />
            <NButton
              class="bg-nandos-fresh-white h-[32px] w-[32px] border border-white border-2 absolute top-3 right-3 z-10"
              size="xs"
              variant="secondary"
              @click="editItem(item)"
            >
              <NIcon icon="pencil" size="sm" class="!text-black" />
            </NButton>
          </div>
        </div>
      </div>

      <!-- Add Items Section -->
      <span class="flex justify-start items-center w-full">
        <RouterLink to="/menu">
          <NButton class="bg-nandos-warm-red-400 h-[32px] w-[32px]" size="xs" variant="secondary">
            <NIcon icon="plus" size="sm" />
          </NButton>
        </RouterLink>
        <p class="ml-4 text-white cursor-pointer" @click="$router.push('/menu')">Add Item</p>
      </span>

      <span class="flex justify-start items-center w-full">
        <NButton class="bg-nandos-warm-red-400 h-[32px] w-[32px]" size="xs" variant="secondary">
          <NIcon icon="plus" size="sm" />
        </NButton>
        <p class="ml-4 text-white">Add Cutlery</p>
      </span>

      <!-- Pricing Summary -->
      <template v-if="basket && basket.items && basket.items.length > 0">
        <span class="flex w-full items-center justify-between text-white">
          <p>Delivery</p>
          <p>{{ formatCurrency(basket?.deliveryPrice, locale) }}</p>
        </span>
        <span class="flex w-full items-center justify-between text-white">
          <p>Total</p>
          <p>{{ formatCurrency(basket?.totalPrice, locale) }}</p>
        </span>
        <NButton
          type="button"
          variant="secondary"
          class="my-4 w-full h-12 bg-nandos-fresh-white !text-black"
          @click="proceedToCheckout"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Loading...' : 'Checkout' }}
        </NButton>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useBasketStoreV2 } from '@/stores/useBasketStoreV2'
import { useAuthStore } from '@/stores/useAuthStore.js'
import { storeToRefs } from 'pinia'
import { NProfileCard } from 'nandos-core-ui-v2'
import { RouterLink } from 'vue-router'
import { NTextHighlight, NButton, NIcon, NTile } from 'nandos-core-ui-v2'
import { formatCurrency } from 'nandos-i18n-v2'
import { onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeaderComponent from '@/components/ui/PageHeaderComponent.vue'

const locale = import.meta.env.VITE_DEFAULT_LOCALE
const router = useRouter()

const basketStore = useBasketStoreV2()
const authStore = useAuthStore()

const { basket, totalItems, isLoading, error } = storeToRefs(basketStore)
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Load basket when component mounts and user is authenticated
onMounted(async () => {
  if (authStore.user === undefined) {
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  if (isAuthenticated.value) {
    try {
      await basketStore.loadBasket(false)
    } catch (err) {
      error.value = `Failed to increase quantity: ${err.message || err}`    }
  } else {
    await router.push('/sign-in?redirect=/basket')
  }
})

// Watch for authentication changes
watch(
  isAuthenticated,
  async (newValue, oldValue) => {
    if (newValue !== oldValue) {
      if (newValue) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        await basketStore.loadBasket(false)
      } else {
        basketStore.clearBasket()
        router.push('/sign-in?redirect=/basket')
      }
    }
  },
  { immediate: false },
)

// Refresh basket function
const refreshBasket = async () => {
  try {
    await basketStore.loadBasket(false) // Use summary first
  } catch (err) {
    error.value = `Refresh failed: ${err.message || err}`
    // Try force refresh as fallback
    try {
      await basketStore.refreshBasket()
    } catch (err2) {
      error.value = `Force refresh also failed: ${err.message || err}`
    }
  }
}

const increaseQuantity = async (item) => {
  try {
    const result = await basketStore.updateItemQuantity(item.id, item.quantity + 1)
  } catch (err) {
    error.value = `Failed to increase quantity: ${err.message || err}`
  }
}

const decreaseQuantity = async (item) => {
  if (item.quantity > 1) {
    try {
      await basketStore.updateItemQuantity(item.id, item.quantity - 1)
    } catch (err) {
      error.value = `Failed to increase quantity: ${err.message || err}`
    }
  } else {
    try {
      await basketStore.removeItem(item.id)
    } catch (err) {
      error.value = `Failed to increase quantity: ${err.message || err}`
    }
  }
}

const editItem = (item) => {
  console.log('Edit item:', item)
}

// Proceed to checkout
const proceedToCheckout = () => {
  if (!isAuthenticated.value) {
    router.push('/sign-in?redirect=/checkout')
    return
  }
  router.push('/checkout')
}
</script>
