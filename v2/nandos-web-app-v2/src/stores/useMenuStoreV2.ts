import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { MenuItem, MenuCategory, MenuFilterOptions, CacheReason, CachedData } from '@/types/menu.types'
import { useOrderSetupStore } from '@/stores/orderSetupStore.ts'
import { useAuthStore } from './useAuthStore'

import MenuService from 'nandos-middleware-api/src/service/menu/my-menu-service'
import PromotionsService from 'nandos-middleware-api/src/service/promotions-service'
import LanguageService, { LANGUAGE_CHANGED } from 'nandos-middleware-api/src/service/my-language-service'
import { MENU_CHANGED } from 'nandos-middleware-api/src/service/menu/menu-service'

import MenuDisplayItem from 'nandos-middleware-api/src/model/menu-display-item'
import UserProduct from 'nandos-middleware-api/src/model/user-product'

const CACHE_TTL = 12 * 60 * 60 * 1000

export const useMenuStoreV2 = defineStore('menuV2', () => {
  const orderSetupStore = useOrderSetupStore()
  const authStore = useAuthStore()
  const cache = ref(new Map<string, CachedData<any>>())
  const quickLinks = ref<MenuCategory[]>([])
  const selectedQuickLink = ref<string | null>(null)
  const setSelectedQuickLink = (category: MenuCategory) => {
    selectedQuickLink.value = category.idPath
  }
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const activeRequests = ref(new Map<string, Promise<any>>())
  const hasQuickLinks = computed(() => quickLinks.value.length > 0)

  const currentContext = computed(() => ({
    storeId: orderSetupStore.storeId,
    orderType: orderSetupStore.orderType,
    userId: authStore.user?.id,
    language: LanguageService.languageKey
  }))

  const getCacheKey = (type: string, options?: any) => {
    const context = currentContext.value
    return `${type}_${context.storeId}_${context.orderType}_${options?.limit || 'all'}`
  }

  const isCacheValid = (cached: CachedData<any>): boolean => {
    if (!cached) return false

    if (Date.now() - cached.timestamp > CACHE_TTL) return false

    const context = currentContext.value
    if (cached.context?.storeId !== context.storeId) return false
    if (cached.context?.orderType !== context.orderType) return false

    return true
  }

  const getCachedOrFetch = async <T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    transform?: (data: any) => T
  ): Promise<T> => {
    const cached = cache.value.get(cacheKey)
    if (cached && isCacheValid(cached)) {
      console.log(`[MenuStore] Cache hit for ${cacheKey}`)
      return cached.data
    }

    if (activeRequests.value.has(cacheKey)) {
      console.log(`[MenuStore] Request already in progress for ${cacheKey}`)
      return activeRequests.value.get(cacheKey)
    }

    console.log(`[MenuStore] Cache miss for ${cacheKey}, fetching...`)
    const request = fetchFn()
      .then(data => {
        const transformedData = transform ? transform(data) : data
        console.log(`[MenuStore] Fetched ${cacheKey}, got ${Array.isArray(transformedData) ? transformedData.length : 'non-array'} items`)

        cache.value.set(cacheKey, {
          data: transformedData,
          timestamp: Date.now(),
          context: { ...currentContext.value }
        })

        return transformedData
      })
      .finally(() => {
        activeRequests.value.delete(cacheKey)
      })

    activeRequests.value.set(cacheKey, request)
    return request
  }

  const getQuickLinks = async (): Promise<MenuCategory[]> => {
    return await MenuService.getQuickLinks().then((res: MenuDisplayItem) => {
      quickLinks.value = res
      console.log('[MenuStore] Quick links loaded:', res)
      return res
    })
  }

  const getFilteredProducts = async (
    filterType: 'featured' | 'special' | 'favorite' | 'promo' | 'combo' | 'recommended',
    options: MenuFilterOptions = {}
  ): Promise<MenuItem[]> => {
    const cacheKey = getCacheKey(filterType, options)

    return getCachedOrFetch(
      cacheKey,
      async () => {
        const limit = options.limit || 12
        console.log(`[MenuStore] Fetching ${filterType} items with limit ${limit}`)

        switch (filterType) {
          case 'featured':
          case 'recommended':
            const recommendedItems = await MenuService.getRecommendedProducts(limit)
            console.log(`[MenuStore] Got ${recommendedItems.length} recommended items`)
            return recommendedItems

          case 'favorite':
            const favorites = await MenuService.getRecommendedProducts(limit * 2)
            const filtered = favorites.filter((item: MenuDisplayItem) =>
              item.userProduct?.product?.isPopular ||
              (item.userProduct?.product?.userRelevance || 0) > 0.7
            ).slice(0, limit)
            console.log(`[MenuStore] Filtered ${favorites.length} items to ${filtered.length} favorites`)
            return filtered

          case 'promo':
            const promotions = await PromotionsService.getPromotions()
            console.log(`[MenuStore] Got ${promotions.length} promotions`)
            return promotions
              .slice(0, limit)
              .map(promo => new MenuDisplayItem(promo))

          case 'combo':
            const combos = await MenuService.getRandomProducts(
              limit * 2,
              (product: any) => product.productType === 'COMBO' && product.isAvailable()
            )
            const comboItems = combos.slice(0, limit).map(up => new MenuDisplayItem(up, false))
            console.log(`[MenuStore] Got ${comboItems.length} combo items`)
            return comboItems

          case 'special':
            const allProducts = await MenuService.getRandomProducts(limit * 3)
            console.log(`[MenuStore] Got ${allProducts.length} random products for specials`)

            const specials = allProducts
              .filter((up: any) => {
                const product = up.product || up
                const isSpecial = product.isSpecial === true
                const hasOffer = product.hasOffer === true
                const isAvailable = product.isAvailable ? product.isAvailable() : true
                return (isSpecial || hasOffer) && isAvailable
              })
              .slice(0, limit)
              .map(up => new MenuDisplayItem(up, false))

            console.log(`[MenuStore] Filtered to ${specials.length} special items`)
            return specials

          default:
            return []
        }
      },
      (data) => transformProductsToMenuItems(data, filterType)
    )
  }

  const getCategoryItems = async (categoryIdPath: string): Promise<MenuItem[]> => {
    console.log('[MenuStore] Getting category items for:', categoryIdPath)
    const categoryItem = await MenuService.browse(categoryIdPath)
    const items = categoryItem.children?.map(transformToMenuItem) || []
    console.log(`[MenuStore] Category ${categoryIdPath} has ${items.length} items`)
    return items
  }

  const searchProducts = async (query: string, limit = 20): Promise<MenuItem[]> => {
    if (!query.trim()) return []

    const cacheKey = getCacheKey('search', { query, limit })

    return getCachedOrFetch(
      cacheKey,
      () => MenuService.search(query),
      (results) => results.slice(0, limit).map(transformToMenuItem)
    )
  }

  const getImageUrl = (item: any): string => {
    if (item.imageUrl) return item.imageUrl
    if (item.imageCollection?.images?.[0]?.path) return item.imageCollection.images[0].path
    if (item.imageCollection?.images?.[0]?.url) return item.imageCollection.images[0].url
    if (item.image) return item.image
    if (item.images?.[0]?.path) return item.images[0].path
    if (item.images?.[0]?.url) return item.images[0].url
    if (item.images?.[0]) return item.images[0]
    return '/assets/images/menu-item-placeholder.png'
  }

  const transformToMenuItem = (item: any): MenuItem => {
    return {
      idPath: item.idPath,
      name: item.name ?? item.title,
      description: item.description ?? '',
      price: item.price || 0,
      imageUrl: getImageUrl(item),
      accentColor: item.accentColor,
      features: item.features || [],
      available: item.isAvailable ? item.isAvailable() : item.available !== false,
      requiresConfiguration: item.getConfigurationDescription ?
        item.getConfigurationDescription() !== '' :
        false,
      productType: item.productType,
      metadata: item.metadata || {}
    }
  }

  const transformProductsToMenuItems = (items: any[], filterType: string): MenuItem[] => {
    return items.map(item => ({
      ...transformToMenuItem(item),
      badge: getBadgeForFilterType(filterType, item)
    }))
  }

  const getBadgeForFilterType = (filterType: string, item: any): MenuItem['badge'] | undefined => {
    const product = item.userProduct?.product || item.product || item

    switch (filterType) {
      case 'promo':
        return 'promo'
      case 'special':
        return 'special'
      case 'combo':
        return 'combo'
      default:
        if (product.isNew) return 'new'
        if (product.isPopular) return 'popular'
        return undefined
    }
  }

  const clearCache = (reason: CacheReason, selective = true) => {
    console.log(`[MenuStore] Clearing cache: ${reason}`)

    if (!selective) {
      cache.value.clear()
      quickLinks.value = []
      return
    }

    switch (reason) {
      case 'store-changed':
        cache.value.clear()
        quickLinks.value = []
        break

      case 'order-type-changed':
        Array.from(cache.value.keys())
          .filter(key => key.includes('category_') || key.includes('search_'))
          .forEach(key => cache.value.delete(key))
        break

      case 'auth-changed':
        Array.from(cache.value.keys())
          .filter(key =>
            key.includes('recommended_') ||
            key.includes('favorite_') ||
            key.includes('featured_')
          )
          .forEach(key => cache.value.delete(key))
        break

      case 'language-changed':
        cache.value.clear()
        quickLinks.value = []
        break
    }
  }

  const prefetchCategory = async (categoryIdPath: string) => {
    const cacheKey = getCacheKey('category', { idPath: categoryIdPath })
    const cached = cache.value.get(cacheKey)

    if (!cached || !isCacheValid(cached)) {
      getCategoryItems(categoryIdPath).catch(err =>
        console.warn(`Failed to prefetch category ${categoryIdPath}:`, err)
      )
    }
  }

  const withRetry = async <T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn()
      } catch (err) {
        if (i === retries - 1) throw err
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
    throw new Error('Max retries reached')
  }

  watch(() => orderSetupStore.storeId, (newVal, oldVal) => {
    if (newVal !== oldVal && oldVal !== null) {
      clearCache('store-changed')
    }
  })

  watch(() => orderSetupStore.orderType, (newVal, oldVal) => {
    if (newVal !== oldVal && oldVal !== null) {
      clearCache('order-type-changed')
    }
  })

  watch(() => authStore.isAuthenticated, (newVal, oldVal) => {
    if (newVal !== oldVal) {
      clearCache('auth-changed')
    }
  })

  const languageObserver = {
    update: () => clearCache('language-changed')
  }
  LanguageService.addObserver(languageObserver, LANGUAGE_CHANGED, languageObserver.update)

  const menuObserver = {
    update: () => {
      console.log('[MenuStore] Menu changed, clearing cache')
      clearCache('menu-changed', false)
    }
  }
  MenuService.addObserver(menuObserver, MENU_CHANGED, menuObserver.update)

  return {
    quickLinks,
    isLoading,
    error,
    cache,
    hasQuickLinks,
    currentContext,
    getQuickLinks,
    getFilteredProducts,
    getCategoryItems,
    searchProducts,
    clearCache,
    prefetchCategory,
    withRetry,
    selectedQuickLink,
    setSelectedQuickLink,
    getFeaturedItems: (limit?: number) => getFilteredProducts('featured', { limit }),
    getSpecialItems: (limit?: number) => getFilteredProducts('special', { limit }),
    getFavouriteItems: (limit?: number) => getFilteredProducts('favorite', { limit }),
    getPromoItems: (limit?: number) => getFilteredProducts('promo', { limit }),
    getComboItems: (limit?: number) => getFilteredProducts('combo', { limit }),
    getRecommendedProducts: (limit?: number) => getFilteredProducts('recommended', { limit })
  }
})
