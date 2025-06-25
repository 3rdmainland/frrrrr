<template>
  <TransitionWrapper>
    <header
      v-if="showHeader"
      class="bg-[#EEE3DF] h-[56px] px-12 flex justify-between items-center hidden md:flex"
    >
      <div class="w-1/4">
      <NInput
        v-model="searchQuery"
        variant="search"
        placeholder="Search for food"
        class="m-0 text-black"
        bgColor="bg-transparent"
        @focus="goToSearchPage"
      >
        <template #prefix>
          <NIcon icon="search" size="md" />
        </template>
      </NInput></div>
      <div class="flex items-center gap-4" v-if="basketStore.isOrderSetup">
        <NIcon icon="delivery" class="!text-black" />
        <p class="!text-black overflow-hidden whitespace-nowrap text-ellipsis max-w-xs">
          {{ orderTypeText }}
        </p>
        <NButton raised size="lg" variant="primary" class="w-fit text-sm" @click="goToOrderSetup">
          Change
        </NButton>
      </div>
    </header>
  </TransitionWrapper>
</template>

<script setup lang="ts">
import { NIcon, NInput, NButton } from 'nandos-core-ui-v2'
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBasketStoreV2 } from '@/stores/useBasketStoreV2'
import TransitionWrapper from '@/components/ui/TransitionWrapper.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const basketStore = useBasketStoreV2()

const searchQuery = ref((route.query.query as string) || '')
const showHeader = computed(() => ['Home', 'Menu', 'ProductDetail'].includes(route.name as string))

const orderTypeText = computed(() => {
  if (basketStore.isDelivery) {
    return t('header.deliveringTo', {
      address: basketStore.basket?.deliveryAddress,
    })
  }
  if (basketStore.isCollection) {
    return t('header.collectingFrom', {
      address: basketStore.basket?.storeName,
    })
  }
  return ''
})

const goToSearchPage = () => {
  router.push({ name: 'menu-search', query: route.query })
}

const goToOrderSetup = () => {
  router.push({
    name: 'order-setup',
  })
}
</script>
