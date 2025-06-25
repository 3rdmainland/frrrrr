<template>
  <p
    v-if="kerbsideOnlyCollection && kerbsideOnlyCollectionMessage"
    class="text-center text-yellow-400 mb-8"
  >
    {{ kerbsideOnlyCollectionMessage }}
  </p>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
    <div
      v-for="card in orderTypeCards"
      :key="card.type"
      @click="selectOrderType(card.type)"
      class="w-full max-w-sm rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:ring-2 shadow-lg hover:shadow-xl bg-white hover:ring-nandos-black-500"
    >
      <div class="h-32 flex flex-col items-center justify-center" :class="card.bgColor">
        <span class="-rotate-4 flex flex-col items-center justify-center">
          <h1 class="text-3xl font-bold text-white mb-2">{{ card.title }}</h1>
          <p class="rounded-md py-0.5 px-2 text-sm" :class="card.tagBg">{{ card.tagline }}</p>
        </span>
      </div>
      <div class="bg-nandos-fresh-white space-y-1 py-4 px-12">
        <p v-if="deliveryPriceNote" class="text-sm !text-black text-center">
          {{ deliveryPriceNote }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useOrderSetupStore } from '@/stores/orderSetupStore.ts'
import { useBasketStoreV2 } from '@/stores/useBasketStoreV2.ts'
import { useRouter } from 'vue-router'

const router = useRouter()
const orderSetup = useOrderSetupStore()
const basket = useBasketStoreV2()

const kerbsideOnlyCollection = ref(false)
const kerbsideOnlyCollectionMessage = ref('')
const deliveryPriceNote = ref('Take note, menu prices for delivery differ slightly.')

const orderTypeCards = [
  {
    type: 'DELIVERY' as const,
    title: 'Delivery',
    tagline: 'Straight to your door',
    bgColor: 'bg-[#10204F]',
    tagBg: 'bg-[#4788FF]',
  },
  {
    type: 'COLLECTION' as const,
    title: 'Collection',
    tagline: 'Quick and easy pickup',
    bgColor: 'bg-[#4D1222]',
    tagBg: 'bg-[#FA4244]',
  },
  {
    type: 'EAT_IN' as const,
    title: 'Eat In',
    tagline: 'Or come knocking at ours',
    bgColor: 'bg-[#005E57]',
    tagBg: 'bg-[#08D9A7]',
  },
]

const selectOrderType = (type: 'DELIVERY' | 'COLLECTION' | 'EAT_IN') => {
  orderSetup.setOrderType(type)

  const routes = {
    DELIVERY: '/setup/delivery-address',
    COLLECTION: '/setup/collection-location',
    EAT_IN: '/setup/eat-in',
  }

  if (type === 'COLLECTION') {
    const preferredStore = router.currentRoute.value.query.ps as string
    if (preferredStore) {
      router.push({ path: '/order-setup/store-selection', query: { ps: preferredStore } })
      return
    }
  }

  router.push(routes[type])
}
</script>
