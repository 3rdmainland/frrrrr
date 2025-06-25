import { ref, computed } from 'vue'
import StoreService from 'nandos-middleware-api/src/service/store-service.ts'
import { IStore, ORDER_TYPES } from 'nandos-types'
import type { OrderType } from '@/stores/orderSetupStore'

interface StoreLocatorOptions {
  autoSearch?: boolean // Whether to automatically search when coordinates change
  customRadius?: number // Override default radius
}

interface LocationCoordinates {
  latitude: number
  longitude: number
}

export const useStoreLocator = (options: StoreLocatorOptions = {}) => {
  const stores = ref<IStore[]>([])
  const selectedStore = ref<IStore | null>(null)
  const loadingStores = ref(false)
  const hasSearched = ref(false)
  const error = ref<string | null>(null)

  const hasStores = computed(() => stores.value.length > 0)
  const noStoresFound = computed(() => hasSearched.value && !loadingStores.value && stores.value.length === 0)

  const findStores = async (
    coordinates: LocationCoordinates,
    orderType: OrderType,
    orderTime?: number | null,
    customRadius?: number
  ) => {
    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      console.warn('No coordinates provided for store search')
      return
    }

    loadingStores.value = true
    hasSearched.value = true
    stores.value = []
    selectedStore.value = null
    error.value = null

    try {
      const searchRadius = customRadius ||
        options.customRadius ||
        (orderType === ORDER_TYPES.DELIVERY ? 15 : 40)

      console.log('Searching for stores:', {
        coordinates,
        orderType,
        searchRadius,
        orderTime
      })

      const foundStores = await StoreService.locate(
        coordinates.latitude,
        coordinates.longitude,
        searchRadius,
        orderType,
        orderTime || undefined
      )

      stores.value = foundStores.stores || []
      console.log('Found stores:', stores.value.length)

      // Auto-select first store if available and none selected
      if (stores.value.length > 0 && !selectedStore.value) {
        selectedStore.value = stores.value[0]
      }

    } catch (err) {
      console.error('Failed to find stores:', err)
      error.value = err instanceof Error ? err.message : 'Failed to find stores'
      stores.value = []
    } finally {
      loadingStores.value = false
    }
  }

  // Helper function with order setup store integration
  const findStoresFromOrderSetup = async (
    coordinates: LocationCoordinates,
    orderSetupStore: any,
    customRadius?: number
  ) => {
    return findStores(
      coordinates,
      orderSetupStore.orderType,
      orderSetupStore.orderTime,
      customRadius
    )
  }

  // Select a store
  const selectStore = (store: IStore) => {
    selectedStore.value = store
  }

  // Clear selection
  const clearSelection = () => {
    selectedStore.value = null
  }

  // Reset all state
  const reset = () => {
    stores.value = []
    selectedStore.value = null
    loadingStores.value = false
    hasSearched.value = false
    error.value = null
  }

  // Get store status helpers
  const getStoreStatusClass = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-green-400'
      case 'BUSY':
        return 'text-yellow-400'
      case 'CLOSED':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStoreStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available'
      case 'BUSY':
        return 'Busy'
      case 'CLOSED':
        return 'Closed'
      default:
        return status
    }
  }

  // Format time helper
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return 'soon'
    return new Date(timestamp).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return {
    // State
    stores,
    selectedStore,
    loadingStores,
    hasSearched,
    error,

    // Computed
    hasStores,
    noStoresFound,

    // Methods
    findStores,
    findStoresFromOrderSetup,
    selectStore,
    clearSelection,
    reset,

    // Helpers
    getStoreStatusClass,
    getStoreStatusText,
    formatTime,
  }
}
