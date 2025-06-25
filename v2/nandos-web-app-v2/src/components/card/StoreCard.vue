<template>
  <div
    @click="$emit('select', store)"
    :class="[
      'bg-black p-4 rounded-lg cursor-pointer transition-all',
      isSelected ? 'ring-2 ring-white' : 'hover:ring-2 hover:ring-gray-700',
    ]"
  >
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <p class="font-semibold text-white">{{ store.displayName || store.name }}</p>
        <p class="text-sm text-gray-400 mt-1">{{ store.address }}</p>

        <!-- Additional store info -->
        <div class="flex items-center gap-4 mt-2">
          <span class="text-xs text-gray-400">
            Ready by {{ formatTime(store.capacity?.expectedTime || store.storeCapacity?.expectedTime) }}
          </span>
          <span v-if="showDistance" class="text-xs text-gray-400">
            {{ store.distance.toFixed(1) }}km away
          </span>
        </div>
      </div>
      <NIcon v-if="isSelected" icon="peri-peri" size="md" class="text-red-400" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import { NIcon } from 'nandos-core-ui-v2'

interface Store {
  id: string | number
  name: string
  displayName?: string
  address: string
  distance: number
  capacity?: { expectedTime: string }
  storeCapacity?: { expectedTime: string }
}

const props = defineProps<{
  store: Store
  selectedId: string | number | null
  showDistance?: boolean
  formatTime: (time: string) => string
}>()

const emit = defineEmits<{
  (e: 'select', store: Store): void
}>()

const isSelected = computed(() => props.selectedId === props.store.id)
</script>
