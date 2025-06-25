<template>
  <div class="flex flex-col lg:flex-row gap-10 h-[calc(100vh-125px)]">
    <TwoPaneWrapper>
      <template #sidebar>
        <div class="mb-6">
          <NInput
            v-if="!$route.meta?.hideType"
            v-model="orderSetup.orderType"
            class="w-full !rounded-3xl mb-2"
            label="Order Type"
            labelAlign="center"
            disabled
          >
            <template #sufix>
              <NButton
                :stacked="false"
                variant="primary"
                class="p-2"
                @click="$router.push('/setup')"
              >
                Change
              </NButton></template
            >
          </NInput>
          <NInput
            v-model="query"
            placeholder="Enter your delivery address"
            class="w-full !rounded-3xl"
            @input="suggest(query)"
            @keyup.enter="searchLocation(query)"
            @blur="showSug = false"
            label="Address"
            labelAlign="center"
          >
            <template #sufix>
              <button
                @click="useCurrentLocation"
                title="Use my location"
                class="text-gray-400 hover:text-red-400"
              >
                <NIcon icon="location" size="md" />
              </button>
            </template>
          </NInput>

          <ul
            v-if="showSug && suggestions.length"
            class="absolute mt-1 w-full max-h-40 overflow-y-auto bg-gray-800 rounded shadow z-10"
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

          <p class="text-xs text-gray-500 mt-2">Enter your address or use current location</p>
        </div>

        <!-- Saved Addresses -->
        <div v-if="savedAddresses.length" class="mb-6">
          <p class="text-lg font-semibold text-white mb-4 flex justify-center">Saved Addresses</p>
          <div class="space-y-3 p-1 overflow-y-auto">
            <AddressCard
              v-for="addr in savedAddresses"
              :key="addr.id"
              :addr="addr"
              :selected-id="selectedAddress?.id"
              @select="selectSaved"
            />
          </div>
        </div>

      </template>


      <template #footer>
        <NButton
          @click="proceed"
          :disabled="!selectedAddress"
          variant="primary"
          size="lg"
          class="w-full"
        >
          Continue to Store Selection
        </NButton>
        <!-- or any other content -->
      </template>
      <TransitionWrapper>
        <div ref="mapEl" class="flex-1 rounded-3xl !h-full min-h-[40vh]" /> </TransitionWrapper
    ></TwoPaneWrapper>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NInput, NIcon } from 'nandos-core-ui-v2'
import { useOrderSetupStore } from '@/stores/orderSetupStore'
import { useLocationFinder } from '@/composables/useLocationFinder'
import CustomerService from 'nandos-middleware-api/src/service/customer/me-service'
import type { ICustomerAddress } from '@nandos-types'
import TransitionWrapper from '@/components/ui/TransitionWrapper.vue'
import TwoPaneWrapper from '@/components/ui/TwoPaneWrapper.vue'
import AddressCard from '@/components/card/AddressCard.vue'


const router = useRouter()
const orderSetup = useOrderSetupStore()

// Location finder composable
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
} = useLocationFinder({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  darkMode: true,
})

// State
const savedAddresses = ref<ICustomerAddress[]>([])
const selectedAddress = ref(orderSetup.selectedAddress)

// Sync composable selection with store
watch(compSelected, (formattedAddr) => {
  if (!formattedAddr) return

  const customerAddr = {
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
  }

  orderSetup.setAddress(customerAddr)
  selectedAddress.value = customerAddr
  query.value = formattedAddr.formattedAddress
})

// Methods
const selectSaved = (addr: ICustomerAddress) => {
  selectedAddress.value = addr
  orderSetup.setAddress(addr)
  query.value = addr.formattedAddress || ''

  place({
    id: addr.id!,
    name: addr.name!,
    latitude: addr.latitude!,
    longitude: addr.longitude!,
    formattedAddress: addr.formattedAddress!,
    street: addr.street!,
    streetNumber: addr.streetNumber,
    city: addr.city!,
    postalCode: addr.postalCode!,
    country: addr.country!,
    building: addr.building,
    instructions: addr.instructions,
  })
}

const proceed = () => {
  if (selectedAddress.value) {
    router.push('/setup/store-selection')
  }
}

// Initialize
onMounted(async () => {
  init()
  try {
    savedAddresses.value = await CustomerService.getAddresses()
  } catch (error) {
    console.error('Failed to load addresses:', error)
  }
})
</script>
