// components/menu/sections/MenuCategory.vue
<template>
  <section
    :id="categoryId"
    ref="categoryRef"
    class="menu-category mb-8 scroll-mt-20"
  >
    <NMenuSection :title="category.title || category.name" />

    <!-- Loading state -->
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
<!--      <MenuItemSkeleton v-for="i in 4" :key="i" />-->
      loading
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="p-4 bg-red-50 text-red-700 rounded-lg">
      <p class="font-semibold">Failed to load {{ category.title }}</p>
      <p class="text-sm mt-1">{{ error.message }}</p>
      <button
        @click="loadItems"
        class="mt-2 text-sm underline hover:no-underline"
      >
        Try again
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="items.length === 0 && hasLoaded" class="p-8 bg-gray-50 text-gray-500 rounded-lg text-center">
      <p>No items available in this category</p>
    </div>

    <!-- Items grid -->
    <div v-else-if="items.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {{console.log(items)}}
      <NMenuOrderItem
        v-for="item in items"
        :key="item.idPath"
        v-memo="[item.idPath, item.available]"
        :title="item.name"
        :description="item.description"
        :price="formatToCurrency(item.price)"
        :bgImage="item.imageUrl"
        :accentColor="item.accentColor"
        :idPath="item.idPath"
        :available="item.available"
        :badge="item.badge"
        :loading="loadingItems.has(item.idPath)"
        @add-to-basket="handleAddToBasket(item)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useMenuStoreV2 } from '@/stores/useMenuStoreV2'
import { NMenuSection, NMenuOrderItem } from 'nandos-core-ui-v2'
import type { MenuCategory, MenuItem } from '../types/menu.types.ts'
import formatToCurrency from '@/utils/formatToCurrency.ts'

// Props & Emits
const props = defineProps<{
  category: MenuCategory
}>()

const emit = defineEmits<{
  'item-click': [item: MenuItem]
  'error': [error: Error]
}>()

// Store
const menuStore = useMenuStoreV2()

// State
const categoryRef = ref<HTMLElement>()
const items = ref<MenuItem[]>([])
const isLoading = ref(false)
const error = ref<Error | null>(null)
const hasLoaded = ref(false)
const loadingItems = ref(new Set<string>())

// Computed
const categoryId = computed(() => `category-${props.category.idPath.replace(/\//g, '-')}`)

const loadItems = async (force = false) => {
  // Skip if already loaded and not forcing
  if (hasLoaded.value && !force && items.value.length > 0) return

  isLoading.value = true
  error.value = null

  try {
    // Use the store's caching mechanism
    const categoryItems = await menuStore.getCategoryItems(props.category.idPath)
    console.log({ categoryItems})
    items.value = categoryItems
    hasLoaded.value = true
  } catch (err) {
    error.value = err as Error
    emit('error', err as Error)
    console.error(`Failed to load category ${props.category.idPath}:`, err)
  } finally {
    isLoading.value = false
  }
}

const handleAddToBasket = async (item: MenuItem) => {
  loadingItems.value.add(item.idPath)

  try {
    emit('item-click', item)
  } finally {
    // Remove loading state after a short delay for better UX
    setTimeout(() => {
      loadingItems.value.delete(item.idPath)
    }, 300)
  }
}

// Intersection Observer for lazy loading
let observer: IntersectionObserver | null = null

const setupObserver = () => {
  if (!categoryRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasLoaded.value && !isLoading.value) {
          console.log(`Loading category: ${props.category.idPath}`)
          loadItems()
        }
      })
    },
    {
      rootMargin: '200px',
      threshold: 0.01 // Trigger as soon as 1% is visible
    }
  )

  observer.observe(categoryRef.value)
}

// Expose ref for parent scrolling
defineExpose({
  scrollIntoView: () => {
    categoryRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  },
  refresh: () => loadItems(true)
})

// Watch for category changes
watch(() => props.category.idPath, (newPath, oldPath) => {
  if (newPath !== oldPath) {
    hasLoaded.value = false
    items.value = []
    loadItems()
  }
})

// Watch for context changes that might affect items
watch(() => menuStore.currentContext, (newContext, oldContext) => {
  // Only reload if relevant context changed
  if (hasLoaded.value && (
    newContext.storeId !== oldContext?.storeId ||
    newContext.orderType !== oldContext?.orderType
  )) {
    loadItems(true)
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  // Setup observer with a small delay to ensure DOM is ready
  setTimeout(() => {
    setupObserver()

    // If category is already in view, load immediately
    if (categoryRef.value) {
      const rect = categoryRef.value.getBoundingClientRect()
      const inView = rect.top < window.innerHeight && rect.bottom > 0

      if (inView && !hasLoaded.value) {
        loadItems()
      }
    }
  }, 100)

  // Listen for force-load event from parent
  categoryRef.value?.addEventListener('force-load', () => {
    if (!hasLoaded.value && !isLoading.value) {
      loadItems()
    }
  })
})

onUnmounted(() => {
  observer?.disconnect()
  categoryRef.value?.removeEventListener('force-load', loadItems)
})
</script>

<style scoped>
.menu-category {
  /* Ensure proper spacing for fixed header */
  scroll-margin-top: 5rem;
}
</style>
