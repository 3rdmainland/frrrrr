<template>
  <FilteredMenuBase
    title="Combo Meals"
    description="Complete meals with sides and drinks included"
    :fetchMethod="fetchCombos"
  />
</template>

<script setup>
import { useMenuStoreV2 } from '@/stores/useMenuStoreV2'
import FilteredMenuBase from './filtered-menu-base.vue'

const menuStore = useMenuStoreV2()

const fetchCombos = () => {
  return menuStore.getComboItems(16)
}
</script>
