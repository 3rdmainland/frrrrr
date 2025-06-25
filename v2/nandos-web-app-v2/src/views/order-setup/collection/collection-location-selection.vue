<template>
  <div class="flex h-full bg-[#111111]">
    <TwoPaneWrapper>
      <template #sidebar>
        <div class="mb-6 relative">
          <NInput
            v-model="query"
            placeholder="Enter your delivery address"
            class="w-full"
            @input="suggest(query)"
            @keyup.enter="searchLocation(query)"
            @blur="showSug = false"
          >
            <template #sufix>
              <button
                @click="handleUseCurrent"
                title="Use my location"
                class="text-gray-400 hover:text-red-400"
              >
                <NIcon icon="location" size="md" />
              </button>
            </template>
          </NInput>

          <ul
            v-if="showSug"
            class="absolute mt-1 w-full max-h-48 overflow-y-auto bg-gray-800 rounded shadow z-10"
          >
            <li
              v-for="pred in suggestions"
              :key="pred.placeId"
              @mousedown.prevent="select(pred)"
              class="p-2 hover:bg-gray-700 cursor-pointer text-white"
            >
              {{ pred.description }}
            </li>
          </ul>

          <p class="text-xs text-gray-500 mt-2">Find stores near any location</p>
        </div>

        <div v-if="loadingStores" class="mb-6">
          <div class="text-white text-center">
            <NIcon icon="spinner" size="md" class="animate-spin mr-2" />
            Finding nearby stores...
          </div>
        </div>

        <NButton
          v-if="!stores.length && !loadingStores"
          @click="findStores"
          :disabled="!hasLocation"
          variant="primary"
          size="lg"
          class="w-full"
        >
          Find Stores
        </NButton>

        <div v-if="stores.length" class="mb-6">
          <h3 class="text-lg font-semibold text-white mb-4">
            Available Stores ({{ stores.length }})
          </h3>
          <div class="space-y-3">
            <StoreCard
              v-for="store in stores"
              :key="store.id"
              :store="store"
              :selected-id="selectedStore?.id"
              :show-distance="true"
              :format-time="formatTime"
              @select="selectStore"
            />
          </div>

          <NButton
            v-if="selectedStore"
            @click="proceedWithStore"
            variant="primary"
            size="lg"
            class="w-full mt-4"
          >
            Continue with {{ selectedStore.displayName || selectedStore.name }}
          </NButton>
        </div>

        <div v-if="hasSearched && !loadingStores && !stores.length" class="mb-6 text-center">
          <div class="bg-gray-900 p-4 rounded-lg">
            <NIcon icon="store" size="lg" class="text-gray-500 mb-2" />
            <p class="text-white font-medium">No stores found</p>
            <p class="text-gray-400 text-sm mt-1">
              Try searching in a different area or increase the search radius
            </p>
          </div>
        </div>
      </template>

      <TransitionWrapper>
        <div ref="mapEl" class="flex-1 rounded-3xl !h-full min-h-[40vh]"></div>

        <div v-if="hasLocation && !hasSearched" class="absolute top-4 left-4 right-4 max-w-md">
          <div class="bg-gray-900 p-4 rounded-lg shadow-lg">
            <p class="text-white text-sm">
              Click anywhere on the map to change the search location
            </p>
          </div>
        </div>
      </TransitionWrapper>
    </TwoPaneWrapper>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NInput, NIcon } from 'nandos-core-ui-v2'
import { useOrderSetupStore } from '@/stores/orderSetupStore'
import { useLocationFinder } from '@/composables/useLocationFinder'
import { useStoreLocator } from '@/composables/useStoreLocator'
import CustomerAddress from 'nandos-middleware-api/src/model/customer-address'
import { FormattedAddress } from '@/services/placesService.ts'
import BasketService from 'nandos-middleware-api/src/service/basket/my-basket-service.ts'
import TwoPaneWrapper from '@/components/ui/TwoPaneWrapper.vue'
import TransitionWrapper from '@/components/ui/TransitionWrapper.vue'
import StoreCard from '@/components/card/StoreCard.vue' // Use your existing component

const router = useRouter()
const orderSetup = useOrderSetupStore()

const {
  stores,
  selectedStore,
  loadingStores,
  hasSearched,
  findStoresFromOrderSetup,
  selectStore,
} = useStoreLocator()

const {
  mapEl,
  query,
  suggestions,
  showSug,
  init,
  useCurrentLocation,
  search: searchLocation,
  suggest,
  select,
  place,
  selected: compSelected,
  hasLocation,
} = useLocationFinder({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  darkMode: true,
})

const createCustomerAddress = (formattedAddr: FormattedAddress): CustomerAddress => {
  return new CustomerAddress({
    id: formattedAddr.id,
    name: formattedAddr.name,
    formattedAddress: formattedAddr.formattedAddress,
    latitude: formattedAddr.latitude,
    longitude: formattedAddr.longitude,
    street: formattedAddr.street,
    streetNumber: formattedAddr.streetNumber,
    city: formattedAddr.city,
    postalCode: formattedAddr.postalCode,
    country: formattedAddr.country,
    building: formattedAddr.building,
    instructions: formattedAddr.instructions,
  })
}

const formatTime = (time: string) => {
  if (!time) return 'N/A'
  try {
    const date = new Date(time)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return time
  }
}

watch(compSelected, (formattedAddr) => {
  if (!formattedAddr) return

  const customerAddr = createCustomerAddress(formattedAddr)
  orderSetup.setCollectionSearchLocation(customerAddr)
  query.value = formattedAddr.formattedAddress
  findStores()
})

const handleUseCurrent = async () => {
  try {
    await useCurrentLocation()
  } catch (err) {
    console.error('Geolocation failed', err)
  }
}

const findStores = async () => {
  if (!compSelected.value) return

  await findStoresFromOrderSetup(
    {
      latitude: compSelected.value.latitude,
      longitude: compSelected.value.longitude,
    },
    orderSetup,
  )
}

const proceedWithStore = async () => {
  if (!selectedStore.value) return

  orderSetup.setStore(selectedStore.value)

  try {
    const config = orderSetup.getOrderConfig()
    await BasketService.configureOrder(config)
    setTimeout(() => router.push('/menu'), 2000)
  } catch (error: any) {
    console.error('Failed to configure order:', error)
  }
}

onMounted(async () => {
  try {
    await init()
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (orderSetup.collectionSearchAddress) {
      query.value = orderSetup.collectionSearchAddress.formattedAddress || ''
      if (
        orderSetup.collectionSearchAddress.latitude &&
        orderSetup.collectionSearchAddress.longitude
      ) {
        try {
          place(
            {
              lat: orderSetup.collectionSearchAddress.latitude,
              lng: orderSetup.collectionSearchAddress.longitude,
            },
            orderSetup.collectionSearchAddress.formattedAddress || '',
          )
          findStores()
        } catch (placeError) {
          console.warn('Failed to restore map location:', placeError)
          findStores()
        }
      }
    }
  } catch (initError) {
    console.error('Failed to initialize map:', initError)
  }
})
</script>
