<template>
  <div v-if="showSection" class="featured-section mb-6">
    <NMenuSection title="Featured" />

    <div v-if="isLoading" class="flex overflow-x-hidden gap-4">
      <div
        v-for="i in 4"
        :key="i"
        class="max-w-[144px] min-w-[144px] h-[144px] bg-gray-50 animate-pulse rounded flex-shrink-0"
      ></div>
    </div>

    <div v-else-if="error" class="p-4 bg-yellow-100 text-yellow-800 rounded">
      <p class="font-semibold">Unable to load featured items</p>
      <button @click="forceRefresh" class="text-sm underline mt-2">
        Try again
      </button>
    </div>

    <div v-else-if="items.length > 0" ref="containerRef" class="relative w-full">
      <NCarousel
        v-if="shouldEnableCarousel"
        class="w-full"
        :autoplay="0"
        dir="ltr"
        enabled
        :gap="2"
        height="auto"
        :ignoreAnimations="false"
        :itemsToScroll="itemsToScrollCount"
        :itemsToShow="itemsToShowCount"
        :modelValue="0"
        mouseDrag
        :paginateDisableOnClick="false"
        :pauseAutoplayOnHover="false"
        :preventExcessiveDragging="false"
        snapAlign="start"
        touchDrag
        :transition="300"
        :wrapAround="false"
      >
        <NCarouselSlide v-for="(item, index) in items" :key="index" class="!items-start">
          <NMenuFeaturedItem
            v-memo="[item.idPath]"
            :price="item.price"
            :description="item.description"
            :bgImage="item.bgImage"
            :idPath="item.idPath"
            :tagText="item.tagText"
            :tagType="item.tagType"
          />
        </NCarouselSlide>
      </NCarousel>

      <div v-else class="flex gap-2 overflow-x-auto">
        <NMenuFeaturedItem
          v-for="(item, index) in items"
          :key="index"
          v-memo="[item.idPath]"
          :price="item.price"
          :description="item.description"
          :bgImage="item.bgImage"
          :idPath="item.idPath"
          :tagText="item.tagText"
          :tagType="item.tagType"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted, computed } from 'vue'
import { NCarousel, NCarouselSlide, NMenuFeaturedItem, NMenuSection } from 'nandos-core-ui-v2'
import { useMenuStoreV2 } from '@/stores/useMenuStoreV2'
import { formatCurrency } from 'nandos-i18n-v2'
import { useAuthStore } from '@/stores/useAuthStore.js'

const emit = defineEmits(['item-click', 'error'])

const menuStore = useMenuStoreV2()
const authStore = useAuthStore()
const items = ref([])
const isLoading = ref(false)
const error = ref(null)
const hasLoadedOnce = ref(false)
const containerRef = ref(null)
const shouldEnableCarousel = ref(false)
const windowWidth = ref(window.innerWidth)

const showSection = computed(() => {
  return isLoading.value || error.value || items.value.length > 0
})

const itemsToShowCount = computed(() => {
  if (!containerRef.value) return 2
  const containerWidth = containerRef.value.clientWidth
  const itemWidth = 144
  const itemGap = 2
  const itemsCount = Math.floor((containerWidth + itemGap) / (itemWidth + itemGap))
  return Math.max(1, Math.min(itemsCount, 6))
})

const itemsToScrollCount = computed(() => {
  return Math.max(1, Math.floor(itemsToShowCount.value / 2))
})

watch(
  () => authStore.isAuthenticated,
  () => {
    if (hasLoadedOnce.value) {
      loadItems()
    }
  },
)

const checkOverflow = async () => {
  await nextTick()
  if (containerRef.value && items.value.length > 0) {
    windowWidth.value = window.innerWidth
    const totalItemsWidth = items.value.length * 144 + (items.value.length - 1) * 2
    const containerWidth = containerRef.value.clientWidth
    shouldEnableCarousel.value = totalItemsWidth > containerWidth
  }
}

watch(items, checkOverflow)

const forceRefresh = async () => {
  menuStore.clearCache('featured', true)
  await loadItems()
}

const loadItems = async () => {
  isLoading.value = true
  error.value = null

  try {
    const featuredItems = await menuStore.getFeaturedItems(10)
    console.log('[FeaturedSection] Loaded items:', featuredItems.length)

    items.value = featuredItems.map((item) => ({
      price: formatCurrency(item.price, import.meta.env.VITE_DEFAULT_LOCALE),
      description: item.name,
      bgImage: item.imageUrl,
      idPath: item.idPath,
      tagText: item.badge === 'new' ? 'New' : item.badge === 'popular' ? 'Popular' : '',
      tagType: item.badge === 'new' ? 'new' : 'info',
    }))

    hasLoadedOnce.value = true
    checkOverflow()
  } catch (err) {
    console.error('[FeaturedSection] Failed to load items:', err)
    error.value = err
    emit('error', err)
  } finally {
    isLoading.value = false
  }
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
  checkOverflow()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadItems()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
