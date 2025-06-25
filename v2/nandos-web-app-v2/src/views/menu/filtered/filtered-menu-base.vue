<template>
  <div class="menu">
    <div class="p-4 sm:p-12 flex flex-col">
      <div class="mb-6">
        <h1 class="text-3xl font-bold mb-4">{{ title }}</h1>
        <p v-if="description" class="text-lg mb-6">{{ description }}</p>

        <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-for="i in 8" :key="i" class="h-[200px] bg-gray-50 animate-pulse rounded-2xl"></div>
        </div>

        <div v-else-if="error" class="p-4 bg-red-100 text-red-700 rounded">
          {{ error }}
        </div>

        <section v-else class="menu-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <NMenuOrderItem
            v-for="(item, index) in items"
            :key="index"
            :title="item.name"
            :description="item.description"
            :price="formatCurrency(item.price, defaultLocale)"
            :bgImage="item.imageUrl || item.imageCollection?.images?.[0]?.path"
            :badge="item.badge || getBadge(item)"
            :features="item.features || []"
            :available="item.available !== false"
            :idPath="item.idPath"
            @add-to-basket="addItemToBasket"
          />
        </section>
      </div>

      <NButton
        v-if="showBackButton"
        @click="router.push('/menu')"
        variant="secondary"
        class="mt-4"
      >
        Back to Full Menu
      </NButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NMenuOrderItem, NButton } from 'nandos-core-ui-v2'
import { useMenuStoreV2 } from '@/stores/useMenuStoreV2'
import { formatCurrency } from 'nandos-i18n-v2'
import { useBasket } from 'nandos-middleware-api/src/domain/basket'
import { useGlobalConfigStore } from '@/stores/useGlobalConfig.js'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  fetchMethod: {
    type: Function,
    required: true
  },
  showBackButton: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const menuStore = useMenuStoreV2()
const { addItem } = useBasket()
const items = ref([])
const isLoading = ref(true)
const error = ref(null)
const { defaultLocale } = useGlobalConfigStore()

const getBadge = (item) => {
  if (item.isNew) return 'New'
  if (item.isPopular) return 'Popular'
  if (item.isPromo) return 'Promo'
  if (item.isSpecial) return 'Special'
  if (item.isRandom) return 'Discover'
  return null
}

const addItemToBasket = async (idPath) => {
  if (!idPath) {
    console.error('Cannot add item to basket: idPath is missing')
    return
  }

  try {
    // Find the item in our items array
    const item = items.value.find(item => item.idPath === idPath)

    if (!item) {
      console.error(`Item with idPath ${idPath} not found in items array`)
      return
    }

    // Create a basket item
    const basketItem = {
      id: idPath,
      productId: idPath,
      quantity: 1,
      price: typeof item.price === 'string'
        ? parseFloat(item.price.replace(/[^0-9.]/g, ''))
        : item.price,
      name: item.name || item.title,
      configuration: item.description || ''
    }

    // Add the item to the basket
    addItem(basketItem)
  } catch (err) {
    console.error('Failed to add item to basket:', err)
  }
}

const loadItems = async () => {
  isLoading.value = true
  error.value = null

  try {
    items.value = await props.fetchMethod()
  } catch (err) {
    error.value = `Failed to load items: ${err.message || err}`
    console.error(error.value, err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadItems)
</script>
