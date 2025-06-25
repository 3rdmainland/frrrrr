<template>
  <div class="flex flex-col lg:flex-row gap-10 h-[calc(100vh-125px)]">
    <TwoPaneWrapper>
      <template #sidebar>
        <!-- Address Display using AddressCard -->
        <div v-if="displayAddress" class="mb-6">
          <p>{{ addressLabel }}</p>
          <AddressCard
            :addr="addressData"
            :selectedId="addressData.id"
            @select="() => {}"
            class="pointer-events-none"
          />
        </div>

        <!-- Fulfillment Time Selection -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-white mb-3">When would you like your order?</h3>
          <div class="grid grid-cols-2 gap-3 h-12">
            <NButton
              @click="setFulfillmentType('ASAP')"
              :variant="fulfillmentType === 'ASAP' ? 'primary' : 'secondary'"
              class="w-full"
            >
              ASAP
            </NButton>
            <NButton
              @click="setFulfillmentType('FUTURE')"
              :variant="fulfillmentType === 'FUTURE' ? 'primary' : 'secondary'"
              class="w-full"
            >
              Schedule for later
            </NButton>
          </div>
        </div>

        <!-- Time Selection (if FUTURE) -->
        <div v-if="fulfillmentType === 'FUTURE'" class="mb-6">
          <label class="block text-sm font-medium text-gray-300 mb-2">Select time</label>
          <NInput v-model="selectedTime" type="time" class="w-full" @change="updateOrderTime" />
        </div>

        <h3 class="text-lg font-semibold text-white mb-3">Available stores</h3>
        <!-- Loading State -->
        <div v-if="loadingStores" class="flex justify-center py-8">
          <NIcon icon="spinner" size="2xl" class="animate-spin text-red-400" />
        </div>

        <!-- No Stores Found -->
        <NAlert
          v-else-if="!loadingStores && stores.length === 0"
          variant="error"
          title="No stores available"
          :subtext="noStoresMessage"
          class="mb-6"
        />

        <!-- Store List using StoreCard -->
        <div v-else class="p-1 space-y-3 mb-6">
          <StoreCard
            v-for="store in stores"
            :key="store.id"
            :store="store"
            :selectedId="selectedStore?.id"
            :showDistance="!isDelivery"
            :formatTime="formatTime"
            @select="selectStore"
          />
        </div>
      </template>
      <template #footer>
        <!-- Continue Button -->
        <NButton
          @click="proceedToNextStep"
          :disabled="!selectedStore"
          variant="primary"
          size="lg"
          class="w-full"
        >
          Continue to Confirmation
        </NButton></template
      >

      <TransitionWrapper>
        <div ref="mapEl" class="flex-1 rounded-3xl !h-full min-h-[40vh]" />
      </TransitionWrapper>
    </TwoPaneWrapper>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NInput, NIcon, NAlert } from 'nandos-core-ui-v2'
import { useOrderSetupStore } from '@/stores/orderSetupStore.ts'
import { useStoreLocator } from '@/composables/useStoreLocator'
import TwoPaneWrapper from '@/components/ui/TwoPaneWrapper.vue'
import TransitionWrapper from '@/components/ui/TransitionWrapper.vue'
import { useLocationFinder } from '@/composables/useLocationFinder.ts'
import AddressCard from '@/components/card/AddressCard.vue'
import StoreCard from '@/components/card/StoreCard.vue'
import BasketService from 'nandos-middleware-api/src/service/basket/my-basket-service.ts'
import { useGlobalAlert } from '@/composables/useGlobalShowAlert.ts'

// Router and services
const router = useRouter()
const orderSetupStore = useOrderSetupStore()
const { showAlert } = useGlobalAlert()

// Use the store locator composable
const {
  stores,
  selectedStore,
  loadingStores,
  noStoresFound,
  findStoresFromOrderSetup,
  selectStore,
  formatTime,
} = useStoreLocator()

const { mapEl } = useLocationFinder({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  darkMode: true,
})

// State
const fulfillmentType = ref(orderSetupStore.fulfillmentType)
const selectedTime = ref('')

// Computed
const isDelivery = computed(() => orderSetupStore.orderType === 'DELIVERY')
const isCollection = computed(() => orderSetupStore.orderType === 'COLLECTION')

const headerText = computed(() =>
  isDelivery.value ? 'Choose your store' : 'Choose a store to collect from',
)

const displayAddress = computed(() => {
  if (isDelivery.value && orderSetupStore.selectedAddress) {
    return orderSetupStore.selectedAddress.formattedAddress
  }
  if (isCollection.value && orderSetupStore.collectionSearchAddress) {
    return orderSetupStore.collectionSearchAddress.formattedAddress
  }
  return null
})

// Create a computed property for address data in the format expected by AddressCard
const addressData = computed(() => {
  const address = isDelivery.value
    ? orderSetupStore.selectedAddress
    : orderSetupStore.collectionSearchAddress
  return {
    id: address?.id || 'current-address',
    name: isDelivery.value ? 'Delivery Address' : 'Collection Location',
    formattedAddress: displayAddress.value || '',
    ...address,
  }
})

const addressLabel = computed(() => (isDelivery.value ? 'Delivering to:' : 'Searching near:'))

const noStoresMessage = computed(() =>
  isDelivery.value ? 'No stores can deliver to this address' : 'No stores found near this location',
)

const setFulfillmentType = (type: 'ASAP' | 'FUTURE') => {
  fulfillmentType.value = type
  orderSetupStore.setFulfillmentType(type)
}

const updateOrderTime = () => {
  if (selectedTime.value) {
    const [hours, minutes] = selectedTime.value.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    orderSetupStore.setOrderTime(date.getTime())
  }
}

const proceedToNextStep = async () => {
  if (!selectedStore.value) return

  orderSetupStore.setStore(selectedStore.value)
  const config = orderSetupStore.getOrderConfig()
  await BasketService.configureOrder(config).then(() => {
    showAlert({
      variant: 'success',
      title: `Order setup complete`,
    })
    router.push('/menu')
  })
}

// Find stores using the composable
const findStores = async () => {
  let coordinates = null

  // Get coordinates based on order type
  if (isDelivery.value && orderSetupStore.selectedAddress) {
    coordinates = {
      latitude: orderSetupStore.selectedAddress.latitude!,
      longitude: orderSetupStore.selectedAddress.longitude!,
    }
  } else if (isCollection.value && orderSetupStore.collectionSearchAddress) {
    coordinates = {
      latitude: orderSetupStore.collectionSearchAddress.latitude!,
      longitude: orderSetupStore.collectionSearchAddress.longitude!,
    }
  }

  if (!coordinates) {
    console.error('No coordinates available for store search')
    return
  }

  await findStoresFromOrderSetup(coordinates, orderSetupStore)
}

// Watch for fulfillment type changes
watch([fulfillmentType], () => {
  findStores()
})

// Lifecycle
onMounted(() => {
  // Check if we have required data
  if (!orderSetupStore.orderType) {
    router.push('/setup')
    return
  }

  if (isDelivery.value && !orderSetupStore.selectedAddress) {
    router.push('/setup/delivery-address')
    return
  }

  if (isCollection.value && !orderSetupStore.collectionSearchAddress) {
    router.push('/setup/collection-location')
    return
  }

  findStores()
})
</script>
