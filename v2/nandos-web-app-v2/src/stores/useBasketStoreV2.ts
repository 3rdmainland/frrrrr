import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import LegacyBasketService, {
  BASKET_CONTENTS_CHANGED,
  ORDER_SETUP_CHANGED,
} from 'nandos-middleware-api/src/service/basket/my-basket-service.ts'
import MyMenuService from 'nandos-middleware-api/src/service/menu/my-menu-service.ts'
import MyProductAvailabilityService from 'nandos-middleware-api/src/service/product-availability/my-product-availability-service.ts'
import { IBasket, IFoodBasketItem, ORDER_TYPES } from 'nandos-types'
import UserProduct from 'nandos-middleware-api/src/model/user-product.ts'
import { useGlobalAlert } from '@/composables/useGlobalShowAlert.ts'

export const useBasketStoreV2 = defineStore('basketV2', () => {
  const basket = ref<IBasket<IFoodBasketItem> | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const { showAlert } = useGlobalAlert()

  const loadBasket = async (forceRefresh = false) => {
    isLoading.value = true
    error.value = null

    try {
      if (!LegacyBasketService.customerId) {
        basket.value = null
        return null
      }

      let res
      if (forceRefresh) {
        try {
          res = await LegacyBasketService.getBasket(true)
        } catch (availabilityErr: any) {
          if (availabilityErr.message?.includes('getProductMap')) {
            res = await LegacyBasketService.getBasketSummary()
          } else {
            throw availabilityErr
          }
        }
      } else {
        res = await LegacyBasketService.getBasketSummary()
      }

      basket.value = res
      return res
    } catch (err: any) {
      error.value = err

      // If it's an authentication error, clear the basket
      if (err?.status === 401 || err?.status === 403) {
        basket.value = null
      }

      return null
    } finally {
      isLoading.value = false
    }
  }

  const clearBasket = () => {
    basket.value = null
    error.value = null
  }

  const refreshBasket = () => {
    return loadBasket(true)
  }

  const addItem = async (userProduct: UserProduct) => {

    console.log({ userProduct})
    // if (!userProduct.isValidState()) {
    //   console.log('cant')
    // }
    //
    // try {
    //   isLoading.value = true
    //   const updated = await LegacyBasketService.addBasketItem(userProduct)
    //   basket.value = updated
    //   console.log('updated', userProduct)
    //   showAlert({
    //     variant: 'success',
    //     title: `${userProduct.product.shortName} added to cart`,
    //   })
    //   return updated
    // } catch (err: any) {
    //   error.value = err
    //   showAlert({
    //     variant: 'error',
    //     title: 'Failed to add to cart',
    //     subtext: 'is now in your basket.',
    //   })
    //   throw err
    // } finally {
    //   isLoading.value = false
    // }
  }

  const removeItem = async (basketItemId: string) => {
    try {
      isLoading.value = true
      const updatedBasket = await LegacyBasketService.removeBasketItem(basketItemId)
      basket.value = updatedBasket
      return updatedBasket
    } catch (err: any) {
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateItem = async (basketItemId: string, userProduct: any) => {
    try {
      isLoading.value = true
      const updatedBasket = await LegacyBasketService.updateBasketItem(basketItemId, userProduct)
      basket.value = updatedBasket
      return updatedBasket
    } catch (err: any) {
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Quantity updates
  const updateItemQuantity = async (basketItemId: string, newQuantity: number) => {
    try {
      isLoading.value = true

      const basketItem = await LegacyBasketService.getBasketItem(basketItemId)
      if (!basketItem) {
        throw new Error('Basket item not found')
      }

      if (!MyProductAvailabilityService.menuService) {
        MyProductAvailabilityService.menuService = MyMenuService
      }

      // Get the current basket item to reconstruct UserProduct
      const originalProduct = await MyMenuService.retrieveUserProduct(basketItem.productId, true)
      if (!originalProduct) {
        throw new Error(`Product not found: ${basketItem.productId}`)
      }
      originalProduct.configureFromBasketItem(basketItem)
      originalProduct.orderQuantity = newQuantity

      const updateResponse = await LegacyBasketService.updateBasketItem(
        basketItemId,
        originalProduct,
      )

      // Check if the response has items - if not, force a full reload
      if (!updateResponse.items || updateResponse.items.length === 0) {
        const fullBasket = await LegacyBasketService.getBasket(true) // true = force recheck availability
        basket.value = fullBasket
      } else {
        basket.value = updateResponse
      }

      return basket.value
    } catch (err: any) {
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const totalItems = computed(() => {
    return basket?.value?.totalItems ?? 0
  })

  const totalPrice = computed(() => {
    return basket?.value?.totalPrice ?? 0
  })

  const hasItems = computed(() => {
    return totalItems.value > 0
  })

  const isOrderSetup = computed(() => {
    return basket.value?.isOrderSetup
  })

  const isDelivery = computed(() => basket.value?.orderType === ORDER_TYPES.DELIVERY)
  const isCollection = computed(() => basket.value?.orderType === ORDER_TYPES.COLLECTION)
  const isEatIn = computed(() => basket.value?.orderType === ORDER_TYPES.EAT_IN)

  // Observers for basket changes from the service
  const observer = {
    update: () => {
      loadBasket(false)
    },
  }

  // Listen for basket changes from the service
  try {
    LegacyBasketService.addObserver(observer, BASKET_CONTENTS_CHANGED, observer.update)
    LegacyBasketService.addObserver(observer, ORDER_SETUP_CHANGED, observer.update)
  } catch (err) {
    console.warn('Failed to setup basket observers:', err)
  }

  return {
    basket,
    totalItems,
    totalPrice,
    hasItems,
    isLoading,
    error,
    isOrderSetup,
    isDelivery,
    isCollection,
    isEatIn,
    loadBasket,
    refreshBasket,
    clearBasket,
    addItem,
    removeItem,
    updateItem,
    updateItemQuantity,
  }
})
