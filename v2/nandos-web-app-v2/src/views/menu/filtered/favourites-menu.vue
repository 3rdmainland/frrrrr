<template>
  <FilteredMenuBase
    title="Everyone's Favourites"
    description="Our most popular dishes loved by Nando's fans"
    :fetchMethod="fetchFavourites"
  />
</template>

<script setup>
import { useMenuStoreV2 } from '@/stores/useMenuStoreV2'
import FilteredMenuBase from './filtered-menu-base.vue'

const menuStore = useMenuStoreV2()

const fetchFavourites = () => {
  return menuStore.getFavouriteItems(16)
}
</script>
