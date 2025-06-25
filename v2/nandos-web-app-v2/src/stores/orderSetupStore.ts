import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import type CustomerAddress from 'nandos-middleware-api/src/model/customer-address'
import { ORDER_TYPES, ORDER_FULFILMENT_TYPE, IStore } from 'nandos-types'

export type OrderType = (typeof ORDER_TYPES)[keyof typeof ORDER_TYPES]
export type FulfillmentType = (typeof ORDER_FULFILMENT_TYPE)[keyof typeof ORDER_FULFILMENT_TYPE]

export const useOrderSetupStore = defineStore('orderSetup', () => {
  const orderType = ref<OrderType | null>(null)
  const storeId = ref<string | null>(null)
  const selectedStore = ref<any>(null)

  // Delivery-specific
  const customerAddressId = ref<string | null>(null)
  const selectedAddress = ref<CustomerAddress | null>(null)

  // Collection-specific
  const collectionSearchAddress = ref<CustomerAddress | null>(null)
  const collectionSearchCoordinates = ref<string | null>(null)

  // Fulfillment
  const fulfillmentType = ref<FulfillmentType>(ORDER_FULFILMENT_TYPE.ASAP)
  const orderTime = ref<number | null>(0)

  // Kerbside collection
  const kerbsideCollect = ref<boolean>(false)
  const customerVehicle = reactive({
    registration: null as string | null,
    make: null as string | null,
    color: null as string | null,
  })

  // Eat-in specific
  const tableId = ref<string | null>(null)

  const isDelivery = computed(() => orderType.value === ORDER_TYPES.DELIVERY)
  const isCollection = computed(() => orderType.value === ORDER_TYPES.COLLECTION)
  const isEatIn = computed(() => orderType.value === ORDER_TYPES.EAT_IN)

  const isComplete = computed(() => {
    if (!orderType.value || !storeId.value) return false

    if (orderType.value === ORDER_TYPES.DELIVERY) {
      return !!customerAddressId.value
    }

    if (orderType.value === ORDER_TYPES.COLLECTION) {
      return !!collectionSearchAddress.value
    }

    if (orderType.value === ORDER_TYPES.EAT_IN) {
      return !!tableId.value
    }

    return true
  })

  const setOrderType = (type: OrderType) => {
    orderType.value = type

    // Reset order-type specific data when switching
    if (type !== ORDER_TYPES.DELIVERY) {
      customerAddressId.value = null
      selectedAddress.value = null
    }

    if (type !== ORDER_TYPES.COLLECTION) {
      collectionSearchAddress.value = null
      collectionSearchCoordinates.value = null
      kerbsideCollect.value = false
      customerVehicle.registration = null
      customerVehicle.make = null
      customerVehicle.color = null
    }

    if (type !== ORDER_TYPES.EAT_IN) {
      tableId.value = null
    }
  }

  const setAddress = (address: CustomerAddress) => {
    selectedAddress.value = address
    customerAddressId.value = address.id ?? null
  }

  const setCollectionSearchLocation = (address: CustomerAddress) => {
    collectionSearchAddress.value = address
    if (address.latitude && address.longitude) {
      collectionSearchCoordinates.value = `${address.latitude},${address.longitude}`
    }
  }

  const setStore = (store: IStore) => {
    selectedStore.value = store
    storeId.value = store.id
  }

  const setFulfillmentType = (type: FulfillmentType) => {
    fulfillmentType.value = type
    if (type === ORDER_FULFILMENT_TYPE.ASAP) {
      orderTime.value = null
    }
  }

  const setOrderTime = (time: number) => {
    orderTime.value = time
    fulfillmentType.value = ORDER_FULFILMENT_TYPE.FUTURE
  }

  const setCustomerVehicle = (
    registration: string | null,
    make: string | null,
    color: string | null,
  ) => {
    customerVehicle.registration = registration
    customerVehicle.make = make
    customerVehicle.color = color
  }

  const setEatInTable = (table: string) => {
    tableId.value = table
  }

  const reset = () => {
    orderType.value = null
    storeId.value = null
    selectedStore.value = null

    customerAddressId.value = null
    selectedAddress.value = null

    collectionSearchAddress.value = null
    collectionSearchCoordinates.value = null

    fulfillmentType.value = ORDER_FULFILMENT_TYPE.ASAP
    orderTime.value = null

    kerbsideCollect.value = false
    customerVehicle.registration = null
    customerVehicle.make = null
    customerVehicle.color = null

    tableId.value = null
  }

  const getOrderConfig = () => {
    const config: Record<string, any> = {
      orderType: orderType.value,
      storeId: storeId.value,
      fulfillmentType: fulfillmentType.value,
    }

    if (fulfillmentType.value === ORDER_FULFILMENT_TYPE.FUTURE && orderTime.value) {
      config.orderTime = orderTime.value
    }

    if (orderType.value === ORDER_TYPES.DELIVERY && selectedAddress.value) {
      config.address = selectedAddress.value
      config.customerAddressId = customerAddressId.value

      if (!customerAddressId.value) {
        delete config.customerAddressId
        delete config.address.id
      }
    }

    if (orderType.value === ORDER_TYPES.COLLECTION) {
      if (collectionSearchAddress.value) {
        config.collectionSearchAddress = collectionSearchAddress.value.formattedAddress
        config.collectionSearchCoordinates = collectionSearchCoordinates.value
      }

      config.kerbsideCollect = kerbsideCollect.value
      if (kerbsideCollect.value) {
        config.customerVehicle = { ...customerVehicle }
      }
    }

    if (orderType.value === ORDER_TYPES.EAT_IN) {
      config.tableId = tableId.value
    }

    return config
  }

  return {
    // state
    orderType,
    storeId,
    selectedStore,
    customerAddressId,
    selectedAddress,
    collectionSearchAddress,
    collectionSearchCoordinates,
    fulfillmentType,
    orderTime,
    kerbsideCollect,
    customerVehicle,
    tableId,

    // getters
    isDelivery,
    isCollection,
    isEatIn,
    isComplete,

    // actions
    setOrderType,
    setAddress,
    setCollectionSearchLocation,
    setStore,
    setFulfillmentType,
    setOrderTime,
    setCustomerVehicle,
    setEatInTable,
    reset,
    getOrderConfig,
  }
})
