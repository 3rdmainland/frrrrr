<template>
  <FilteredMenuBase
    title="Our Promos"
    description="Special deals and limited-time offers"
    :fetchMethod="fetchPromos"
  />
</template>

<script setup>
import { useMenuStoreV2 } from '@/stores/useMenuStoreV2'
import FilteredMenuBase from './filtered-menu-base.vue'

const menuStore = useMenuStoreV2()

const fetchPromos = () => {
  return menuStore.getPromoItems(16)
}
</script>
