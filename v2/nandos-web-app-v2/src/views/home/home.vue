<template>
  <TransitionWrapper>
    <div class="py-8">
      <!-- Add loading state and conditional rendering -->
      <div v-if="isLoading" class="pl-8 mb-8 sm:mb-12 h-64 bg-gray-200 animate-pulse rounded-3xl">
        <div class="h-full w-full flex items-center justify-center">
          <p class="text-white">Loading specials...</p>
        </div>
      </div>

      <!-- Only render carousel when we have data -->
      <NCarousel
        v-else-if="specials.length > 0"
        :key="carouselKey"
        :itemsToShow="1.2"
        :gap="16"
        :autoplay="3000"
        wrapAround
        :itemsToScroll="1"
        dir="ltr"
        snapAlign="start"
        class="pl-8 mb-8 sm:mb-12"
      >
        <NCarouselSlide
          v-for="(item, index) in specials"
          :key="index"
          class="w-full rounded-3xl bg-nandos-fresh-white p-0"
        >
          <NTile :bgImage="item?.imageUrl" wide class="m-0 gap-2">
            <h3 class="text-center text-xl md:text-5xl font-nandos-hand rotate-[-3deg]">
              <span class="bg-black text-white rounded-[5px] px-2"> {{ item.name }} </span>
            </h3>
            <p>
              <span class="bg-green-500 text-black font-bold rounded-[5px] px-2">
                {{ item.description }}
              </span>
            </p>
            <template #bottom-right>
              <div class="text-right flex items-center md:block">
                <p>FROM</p>
                <p>
                  <span class="bg-black text-white rounded-[5px] px-2 mx-2 md:px-0">
                    {{ formatToCurrency(item.price) }}
                  </span>
                </p>
                <button class="px-3 py-1 bg-white rounded-2xl font-bold">Order Now</button>
              </div>
            </template>
          </NTile>
        </NCarouselSlide>
      </NCarousel>

      <!-- Fallback when no specials are available -->
      <div
        v-else
        class="pl-8 mb-8 sm:mb-12 h-64 bg-gray-100 rounded-3xl flex items-center justify-center"
      >
        <p class="text-gray-500">No specials available at the moment</p>
      </div>

      <div class="px-8 flex flex-col items-center w-full">
        <p v-if="!isAuthenticated" class="secondary text-white mb-8 sm:my-8 text-center">
          Help us make your order experience smoother
          <RouterLink to="/sign-in">
            <NButton raised size="lg" variant="primary" class="mx-4"> Sign in </NButton>
          </RouterLink>
        </p>

        <NGrid cols="3" class="w-full">
          <div v-for="item in tiles" :key="item.title">
            <div @click="item.key === 1 ? navigateToMenu(item.link) : router.push(item.link)">
              <NTile :bgImage="item.image" class="m-0 cursor-pointer">
                <h3 class="text-center text-xl md:text-5xl font-nandos-hand -rotate-3">
                  <span class="bg-black text-white rounded px-2">{{ item.title }}</span>
                </h3>
              </NTile>
            </div>
          </div>
        </NGrid>
      </div>
    </div></TransitionWrapper
  >
</template>

<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { NCarousel, NCarouselSlide, NGrid, NTile, NButton } from 'nandos-core-ui-v2'
import { useAuthStore } from '@/stores/useAuthStore.ts'
import { useMenuStoreV2 } from '@/stores/useMenuStoreV2.ts'
import menuImage from '@/assets/img/1.png'
import efImage from '@/assets/img/2.png'
import comboImage from '@/assets/img/3.png'
import promoImage from '@/assets/img/purple-img.png'
import notSureImage from '@/assets/img/brown-img.png'
import giftCardImage from '@/assets/img/green-bg.png'
import { useBasketStoreV2 } from '@/stores/useBasketStoreV2.js'
import { useRouter } from 'vue-router'
import TransitionWrapper from '@/components/ui/TransitionWrapper.vue'
import formatToCurrency from '@/utils/formatToCurrency.ts'

const router = useRouter()
const authStore = useAuthStore()
const menuStore = useMenuStoreV2()
const basketStore = useBasketStoreV2()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const specials = ref([])
const isLoading = ref(true)
const isOrderSetup = ref(false)
const carouselKey = ref(0)

const loadSpecials = async () => {
  try {
    isLoading.value = true
    const promotedProducts = await menuStore.getPromoItems()
    if (Array.isArray(promotedProducts) && promotedProducts.length > 0) {
      specials.value = promotedProducts
      await nextTick()
      carouselKey.value += 1
    } else {
      specials.value = []
    }
  } catch (error) {
    specials.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadSpecials()
})

watch(
  specials,
  async (newSpecials) => {
    if (newSpecials.length > 0) {
      await nextTick()
      carouselKey.value += 1
    }
  },
  { deep: true },
)

const navigateToMenu = async (link) => {
  await basketStore.loadBasket(true)

  if (basketStore.isOrderSetup) {
    router.push(link)
  } else {
    router.push({
      name: 'order-setup',
      query: { redirect: `/menu` },
    })
  }
}

watch(
  basketStore,
  (newBasket) => {
    isOrderSetup.value = newBasket.isOrderSetup
  },
  { immediate: true, deep: true },
)

// Tiles configuration
const tiles = [
  { key: 1, title: 'Our Menu', image: menuImage, link: 'menu' },
  { key: 2, title: 'Everyone’s Favourites', image: efImage, link: 'menu/favorites' },
  { key: 3, title: 'Our Promos', image: promoImage, link: 'menu/promos' },
  { key: 4, title: 'Not sure what to order?', image: notSureImage, link: 'menu/discover' },
  { key: 5, title: 'Combos', image: comboImage, link: 'menu/combos' },
  {
    key: 6,
    title: 'Spoil them with a Gift Card',
    image: giftCardImage,
    link: 'menu/gift-cards',
  },
]
</script>
