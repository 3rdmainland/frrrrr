import { ref, computed, onMounted, onUnmounted } from 'vue'
import { loadGoogleMaps } from '@/services/googleLoader'
import {
  getPredictions,
  getPlaceDetails,
  geocodeAddress,
  reverseGeocode,
  FormattedAddress,
} from '@/services/placesService'
import { darkModeStyles } from '@/styles/mapStyles.ts'

interface Location {
  lat: number
  lng: number
}

interface Options {
  apiKey: string
  center?: Location
  zoom?: number
  darkMode?: boolean
}

export const useLocationFinder = (opts: Options) => {
  const mapEl = ref<HTMLElement | null>(null)
  const map = ref<google.maps.Map | null>(null)
  const marker = ref<google.maps.Marker | null>(null)

  const query = ref('')
  const suggestions = ref<{ placeId: string; description: string }[]>([])
  const showSug = ref(false)

  const selected = ref<FormattedAddress | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const cfg = {
    center: opts.center ?? { lat: -26.2041, lng: 28.0473 },
    zoom: opts.zoom ?? 14,
    dark: opts.darkMode !== false,
  }

  const init = async () => {
    loading.value = true
    try {
      await loadGoogleMaps(opts.apiKey)
      map.value = new google.maps.Map(mapEl.value!, {
        center: cfg.center,
        zoom: cfg.zoom,
        styles: cfg.dark ? darkModeStyles : [],
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      })
      map.value.addListener('click', (e: google.maps.MapMouseEvent) => pick(e.latLng!).then())
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const pick = async (latLng: google.maps.LatLng) => {
    const loc = { lat: latLng.lat(), lng: latLng.lng() }
    try {
      const address = await reverseGeocode(loc)
      place(address)
    } catch (e: any) {
      // Fallback to basic location if reverse geocoding fails
      const fallbackAddress: FormattedAddress = {
        id: `temp_${Date.now()}`,
        name: 'Unknown Location',
        latitude: loc.lat,
        longitude: loc.lng,
        formattedAddress: `${loc.lat}, ${loc.lng}`,
        street: '',
        streetNumber: null,
        city: '',
        postalCode: '',
        country: '',
        building: null,
        instructions: null
      }
      place(fallbackAddress)
    }
  }

  const place = (address: FormattedAddress) => {
    const loc = { lat: address.latitude, lng: address.longitude }

    if (marker.value) marker.value.setPosition(loc)
    else marker.value = new google.maps.Marker({ map: map.value!, position: loc })

    map.value!.panTo(loc)
    selected.value = address
  }

  const useCurrentLocation = async () => {
    const pos = await new Promise<GeolocationPosition>((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej),
    )
    await pick(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude))
  }

  const search = async (text: string) => {
    loading.value = true
    try {
      const address = await geocodeAddress(text)
      // Generate a unique ID for searched addresses
      address.id = `search_${Date.now()}`
      place(address)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const suggest = async (input: string) => {
    try {
      suggestions.value = await getPredictions(input)
      showSug.value = suggestions.value.length > 0
    } catch (e: any) {
      console.error('Suggestion error:', e)
      suggestions.value = []
      showSug.value = false
    }
  }

  const select = async (pred: { placeId: string; description: string }) => {
    showSug.value = false
    query.value = pred.description

    loading.value = true
    try {
      const address = await getPlaceDetails(pred.placeId)
      place(address)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  onMounted(init)
  onUnmounted(() => marker.value?.setMap(null))

  return {
    mapEl,
    query,
    suggestions,
    showSug,
    selected,
    loading,
    error,
    init,
    useCurrentLocation,
    search,
    suggest,
    select,
    place,
    hasLocation: computed(() => !!selected.value),
    locationText: computed(() => selected.value?.formattedAddress ?? ''),
  }
}
