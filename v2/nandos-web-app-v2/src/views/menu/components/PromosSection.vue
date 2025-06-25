<template>
  <div class="promo-section mb-6">
    <NMenuSection title="Promotions" buttonText="All Promos" :buttonAction="navigateToAllPromos" />

    <section class="menu-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <template v-if="isLoading">
        <div v-for="i in 4" :key="i" class="h-[144px] bg-gray-50 animate-pulse rounded-2xl"></div>
      </template>

      <template v-else-if="error">
        <div class="col-span-full p-4 bg-yellow-100 text-yellow-800 rounded">
          <p class="font-semibold">Unable to load promotions</p>
          <button @click="forceRefresh" class="text-sm underline mt-2">
            Try again
          </button>
        </div>
      </template>

      <template v-else-if="items.length > 0">
        <NMenuOrderItem
          v-for="(item, index) in items"
          :key="`promo-${item.idPath}-${index}`"
          :title="item.title"
          :description="item.description"
          :price="item.price"
          :bgImage="item.bgImage"
          :badge="item.badge"
          :features="item.features"
          :available="item.available"
          :idPath="item.idPath"
          :loading="loadingItemId === item.idPath"
          @add-to-basket="handleAddToBasket"
        />
      </template>

      <div v-else class="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
        <p>No promotions available at the moment</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NMenuOrderItem, NMenuSection } from 'nandos-core-ui-v2'
import { useMenuStoreV2 } from '@/stores/useMenuStoreV2'
import { formatCurrency } from 'nandos-i18n-v2'

const emit = defineEmits(['item-click', 'error'])

const router = useRouter()
const menuStore = useMenuStoreV2()
const items = ref([])
const isLoading = ref(false)
const loadingItemId = ref(null)
const error = ref(null)

watch(
  () => menuStore.authStateChanged,
  () => {
    loadItems()
  },
)

const navigateToAllPromos = () => {
  router.push('/menu/promos')
}

const forceRefresh = async () => {
  menuStore.clearCache('promo', true)
  await loadItems()
}

const handleAddToBasket = async (idPath) => {
  if (!idPath) {
    error.value = 'Cannot add item to basket: Invalid item'
    return
  }

  error.value = null
  loadingItemId.value = idPath

  try {
    const item = items.value.find((item) => item.idPath === idPath)

    if (!item) {
      throw new Error(`Item not found: ${idPath}`)
    }

    emit('item-click', {
      idPath: item.idPath,
      name: item.title,
      description: item.description,
      price: item.rawPrice,
      imageUrl: item.bgImage,
      requiresConfiguration: item.requiresConfiguration
    })

  } catch (err) {
    error.value = err.message || 'Failed to add item to basket'
    emit('error', err)
    console.error('[PromoSection] Failed to add item:', err)
  } finally {
    loadingItemId.value = null
  }
}

const loadItems = async () => {
  items.value = []
  isLoading.value = true
  error.value = null

  try {
    const promoItems = await menuStore.getPromoItems(6)
    console.log('[PromoSection] Loaded items:', promoItems.length)

    items.value = promoItems.map((item) => ({
      title: item.name,
      description: item.description || '',
      price: formatCurrency(item.price, import.meta.env.VITE_DEFAULT_LOCALE),
      rawPrice: item.price,
      bgImage: item.imageUrl,
      idPath: item.idPath,
      badge: item.badge || 'Promo',
      features: item.features || [],
      available: item.available !== false,
      requiresConfiguration: item.requiresConfiguration || false
    }))
  } catch (err) {
    console.error('[PromoSection] Failed to load items:', err)
    error.value = err
    emit('error', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadItems)
</script>
