<template>
  <div class="flex h-full bg-[#111111] text-white">
    <aside class="w-1/3 p-6 space-y-6 overflow-y-auto">
      <h1 class="text-3xl font-bold">Find your location</h1>

      <!-- Search + current-location -->
      <div class="relative">
        <NInput
          v-model="searchQuery"
          @keyup.enter="onSearch"
          @input="onInput"
          @blur="hideSuggestions"
          placeholder="Search for a location..."
        >
          <template #sufix>
            <NIcon
              icon="location"
              size="md"
              @click="goCurrent"
            />
          </template>
        </NInput>

        <!-- Suggestions -->
        <ul
          v-if="showSuggestions"
          class="mt-1 max-h-48 overflow-y-auto bg-gray-800 rounded shadow"
        >
          <li
            v-for="s in suggestions"
            :key="s.place_id"
            @mousedown.prevent="selectSuggestion(s)"
            class="p-2 hover:bg-gray-700 cursor-pointer flex items-start gap-3"
          >
            <NIcon icon="location" size="sm" class="text-gray-400 mt-0.5" />
            <div>
              <div class="font-medium">{{ s.structured_formatting.main_text }}</div>
              <div class="text-sm text-gray-400">{{ s.structured_formatting.secondary_text }}</div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Saved addresses -->
      <div v-for="addr in addresses" :key="addr.id">
        <button
          @click="selectSaved(addr)"
          :class="[
            'flex items-start gap-3 w-full p-4 rounded hover:bg-gray-700',
            selectedSavedId === addr.id ? 'bg-green-700' : 'bg-gray-800'
          ]"
        >
          <NIcon icon="peri-peri" size="lg" />
          <div class="flex flex-col items-start">
            <p class="font-medium">{{ addr.name }}</p>
            <p>{{ addr.formattedAddress }}</p>
          </div>
        </button>
      </div>
    </aside>

    <div class="flex-1 relative">
      <div ref="mapEl" class="w-full h-full"></div>
      <div v-if="loading" class="absolute inset-0 bg-black/50 flex items-center justify-center">
        <span class="text-white">Loading map...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, onMounted } from 'vue'
import { NInput, NIcon } from 'nandos-core-ui-v2'
import type { ICustomerAddress } from '@nandos-types'

interface Loc { lat: number; lng: number }

// Props
const props = withDefaults(defineProps<{ addresses?: ICustomerAddress[] }>(), {
  addresses: () => []
})
const { addresses } = toRefs(props)

// Track which saved address is active
const selectedSavedId = ref<string | null>(null)

// Map state
const mapEl = ref<HTMLElement | null>(null)
const map = ref<google.maps.Map | null>(null)
const marker = ref<google.maps.Marker | null>(null)
const loading = ref(true)
const selectedAddress = ref<{ address: string; loc: Loc } | null>(null)

// Search state
const searchQuery = ref('')
const suggestions = ref<google.maps.places.AutocompletePrediction[]>([])
const showSuggestions = ref(false)
let autoSvc: google.maps.places.AutocompleteService
let placesSvc: google.maps.places.Place
let geocoder: google.maps.Geocoder

// Load Google Maps script
async function loadGoogle() {
  if ((window as any).google) return
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject()
    document.head.append(s)
  })
}

// Initialize map
function initMap(center: Loc) {
  map.value = new google.maps.Map(mapEl.value!, {
    center,
    zoom: 14,
    styles: []
  })
  map.value.addListener('click', ({ latLng }) => {
    if (!latLng) return
    const loc = { lat: latLng.lat(), lng: latLng.lng() }
    reverseGeocode(loc)
  })
}

// Setup on mount
async function setup() {
  await loadGoogle()
  autoSvc = new google.maps.places.AutocompleteService()
  geocoder = new google.maps.Geocoder()
  initMap({ lat: -26.2041, lng: 28.0473 })
  placesSvc = new google.maps.places.PlacesService(map.value!)
  loading.value = false
  // Preload first saved address if any
  if (addresses.value.length) {
    selectSaved(addresses.value[0])
  }
}

onMounted(setup)

// Place or move marker
function placeMarker(loc: Loc, title: string) {
  if (!marker.value) {
    marker.value = new google.maps.Marker({ position: loc, map: map.value!, title })
  } else {
    marker.value.setPosition(loc)
    marker.value.setTitle(title)
  }
  map.value!.panTo(loc)
}

// “Use my current location”
async function goCurrent() {
  const pos = await new Promise<Loc>((res, rej) =>
    navigator.geolocation.getCurrentPosition(
      p => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
      rej
    )
  )
  placeMarker(pos, 'Current location')
  selectedAddress.value = { address: 'Current location', loc: pos }
  selectedSavedId.value = null                // clear saved highlight
  searchQuery.value = selectedAddress.value.address
}

// Autocomplete input
function onInput() {
  if (searchQuery.value.length < 2) {
    showSuggestions.value = false
    return
  }
  autoSvc.getPlacePredictions({ input: searchQuery.value }, (pred, status) => {
    if (status === 'OK' && pred) {
      suggestions.value = pred
      showSuggestions.value = true
    }
  })
}
function hideSuggestions() { showSuggestions.value = false }

// Search by text
function onSearch() {
  if (!geocoder || !searchQuery.value) return
  geocoder.geocode({ address: searchQuery.value }, (results, status) => {
    if (status === 'OK' && results?.[0]) {
      const loc = {
        lat: results[0].geometry.location.lat(),
        lng: results[0].geometry.location.lng()
      }
      placeMarker(loc, results[0].formatted_address!)
      selectedAddress.value = { address: results[0].formatted_address!, loc }
      selectedSavedId.value = null
    }
  })
}

// Pick an autocomplete suggestion
function selectSuggestion(s: google.maps.places.AutocompletePrediction) {
  suggestions.value = []
  showSuggestions.value = false
  placesSvc.getDetails({ placeId: s.place_id, fields: ['geometry', 'formatted_address'] }, r => {
    if (!r?.geometry) return
    const loc = { lat: r.geometry.location.lat(), lng: r.geometry.location.lng() }
    placeMarker(loc, r.formatted_address!)
    selectedAddress.value = { address: r.formatted_address!, loc }
    selectedSavedId.value = null
    searchQuery.value = r.formatted_address!
  })
}

// Reverse‐geocode on map‐click
function reverseGeocode(loc: Loc) {
  geocoder.geocode({ location: loc }, (res, status) => {
    const addr = (res && res[0]?.formatted_address) || 'Picked location'
    placeMarker(loc, addr)
    selectedAddress.value = { address: addr, loc }
    selectedSavedId.value = null
    searchQuery.value = addr
  })
}

// Select one of your saved addresses
function selectSaved(a: ICustomerAddress) {
  selectedSavedId.value = a.id
  const loc = { lat: a.latitude, lng: a.longitude }
  placeMarker(loc, a.formattedAddress)
  selectedAddress.value = { address: a.formattedAddress, loc }
  searchQuery.value = a.formattedAddress
}
</script>

<style scoped>
.map-container { height: 100%; }
</style>
