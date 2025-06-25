<template>
  <div
    @click="$emit('select', addr)"
    :class="[
      'bg-black p-4 rounded-lg cursor-pointer transition-all',
      isSelected ? 'ring-2 ring-red-400' : 'hover:ring-2 hover:ring-gray-700',
    ]"
  >
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <p class="font-semibold text-white">{{ addr.name || 'Address' }}</p>
        <p class="text-sm text-gray-400 mt-1">{{ addr.formattedAddress }}</p>
      </div>
      <NIcon v-if="isSelected" icon="peri-peri" size="md" class="text-red-400" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import { NIcon } from 'nandos-core-ui-v2'
import type { ICustomerAddress } from '@nandos-types'

const props = defineProps<{
  addr: ICustomerAddress
  selectedId: string | number | null
}>()

const emit = defineEmits<{
  (e: 'select', addr: ICustomerAddress): void
}>()

const isSelected = computed(() => props.selectedId === props.addr.id)
</script>
