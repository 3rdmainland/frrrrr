<template>
  <div class="menu" ref="menuContainer">
    <Suspense v-if="shouldShowQuickLinks">
      <NMenuNav
        :links="quickLinks"
        @link-click="handleCategoryClick"
        :active-link="selectedCategory"
        class="bg-nandos-black sticky top-0 z-10 w-full"
      />
    </Suspense>

    <div class="p-6 sm:p-12 flex flex-col">
      <Suspense>
        <LazyFeaturedSection
          @item-click="handleItemClick"
          @error="menuError.setError('featured', $event)"
        />
      </Suspense>

      <Suspense v-if="isAuthenticated">
        <LazyOrderAgainSection
          @item-click="handleItemClick"
          @error="menuError.setError('order-again', $event)"
        />
      </Suspense>

      <Suspense>
        <LazySpecialsSection
          @item-click="handleItemClick"
          @error="menuError.setError('specials', $event)"
        />
      </Suspense>

<!--      <Suspense>-->
<!--        <LazyPromoSection-->
<!--          @item-click="handleItemClick"-->
<!--          @error="menuError.setError('promos', $event)"-->
<!--        />-->
<!--      </Suspense>-->

      <template v-for="(category, index) in visibleCategories" :key="category.idPath">
        <LazyMenuCategory
          :category="category"
          :index="index"
          :ref="(el) => menuNav.setCategoryRef(category.idPath, el)"
          @item-click="handleItemClick"
          @error="menuError.setError(`category-${category.idPath}`, $event)"
        />
      </template>

      <div ref="infiniteScrollTrigger" class="h-10"></div>
    </div>

    <Transition name="fade">
      <button
        v-if="showScrollToTop"
        @click="scrollToTop"
        class="fixed bottom-24 right-4 z-50 p-3 rounded-full bg-nandos-red shadow-lg hover:bg-nandos-red-dark transition-all duration-300"
        aria-label="Scroll to top"
      >
        <NIcon icon="arrow-up" size="xl" class="text-white" />
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMenuStoreV2 } from '@/stores/useMenuStoreV2'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMenuBasket } from './composables/useMenuBasket'
import { useMenuNavigation } from './composables/useMenuNavigation'
import { useMenuError } from './composables/useMenuError'
import { NMenuNav, NIcon } from 'nandos-core-ui-v2'
import type { MenuItem, MenuCategory } from '@/types/menu.types'

const LazyFeaturedSection = defineAsyncComponent(() => import('./components/FeaturedSection.vue'))
const LazyOrderAgainSection = defineAsyncComponent(
  () => import('./components/OrderAgainSection.vue'),
)
const LazySpecialsSection = defineAsyncComponent(() => import('./components/SpecialsSection.vue'))
// const LazyPromoSection = defineAsyncComponent(() => import('./components/PromoSection.vue'))
const LazyMenuCategory = defineAsyncComponent(() => import('./components/MenuCategory.vue'))

const menuStore = useMenuStoreV2()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
const menuBasket = useMenuBasket()
const menuNav = useMenuNavigation()
const menuError = useMenuError()

const menuContainer = ref<HTMLElement>()
const infiniteScrollTrigger = ref<HTMLElement>()
const visibleCategoryCount = ref(3)
const showScrollToTop = ref(false)
const scrollThreshold = 300

const shouldShowQuickLinks = computed(() => menuStore.hasQuickLinks)
const quickLinks = computed(() => menuStore.quickLinks)
const selectedCategory = computed(() => menuNav.selectedCategory.value)

const visibleCategories = computed(() => {
  return quickLinks.value.slice(0, visibleCategoryCount.value)
})

const handleCategoryClick = async (category: MenuCategory) => {
  const index = quickLinks.value.findIndex((cat) => cat.idPath === category.idPath)
  if (index >= visibleCategoryCount.value) {
    visibleCategoryCount.value = index + 1
  }

  await menuNav.scrollToCategory(category.idPath)
}

const handleItemClick = async (item: MenuItem) => {
  try {
    await menuBasket.addItemToBasket(item)
  } catch (error) {
    menuError.setError('basket-add', error as Error)
  }
}

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  showScrollToTop.value = scrollTop > scrollThreshold
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const observeInfiniteScroll = () => {
  if (!infiniteScrollTrigger.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && visibleCategoryCount.value < quickLinks.value.length) {
          visibleCategoryCount.value += 1
        }
      })
    },
    {
      rootMargin: '100px',
      threshold: 0.1
    }
  )

  observer.observe(infiniteScrollTrigger.value)
  return observer
}

let infiniteScrollObserver: IntersectionObserver | null = null

watch(
  () => menuNav.selectedCategory.value,
  (newCategory) => {
    if (newCategory) {
      menuNav.scrollToCategory(newCategory)
    }
  },
)

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  infiniteScrollObserver = observeInfiniteScroll()

  try {
    await menuStore.getQuickLinks()
  } catch (error) {
    menuError.setError('quicklinks', error as Error)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  infiniteScrollObserver?.disconnect()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
