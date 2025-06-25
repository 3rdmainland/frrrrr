import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBasketStoreV2 } from '@/stores/useBasketStoreV2'
import type { MenuItem } from '../types/menu.types'

export const useMenuBasket = () => {
  const router = useRouter()
  const basketStore = useBasketStoreV2()
  const isAdding = ref(false)
  const error = ref<Error | null>(null)

  const addItemToBasket = async (item: MenuItem | string) => {
    error.value = null
    isAdding.value = true

    try {
      const idPath = typeof item === 'string' ? item : item.idPath
      if (typeof item === 'object' && item.requiresConfiguration) {
        router.push({
          name: 'product-detail',
          params: { productId: encodeURIComponent(idPath) }
        })
        return
      }

      await basketStore.addItem({
        productId: idPath,
        quantity: 1,
        ...(typeof item === 'object' && {
          price: item.price,
          name: item.name,
          configuration: item.description
        })
      })
      return true
    } catch (err) {
      error.value = err as Error
      console.error('Failed to add item to basket:', err)
      throw err
    } finally {
      isAdding.value = false
    }
  }

  const quickAddToBasket = async (idPath: string) => {
    return addItemToBasket(idPath)
  }

  return {
    addItemToBasket,
    quickAddToBasket,
    isAdding,
    error
  }
}
