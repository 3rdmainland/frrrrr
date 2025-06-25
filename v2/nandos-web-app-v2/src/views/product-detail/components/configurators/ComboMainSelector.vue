<template>
  <!-- For COMBO_MAIN, we don't show an accordion, just render the nested options directly -->
  <div class="combo-main-options">
    <!-- Iterate through SIMPLE products inside COMBO_MAIN -->
    <template v-for="item in simpleProducts" :key="getItemId(item)">
      <!-- Directly render the SIMPLE product's configuration options WITHOUT wrapper -->
      <ConfigurationRenderer
        :product="item"
        @update:selections="handleNestedSelections(getItemId(item), $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import ConfigurationRenderer from '../ConfigurationRenderer.vue'

const props = defineProps<{
  group: any
}>()

const emit = defineEmits<{
  'update:selection': [value: any]
}>()

// Get SIMPLE products within this COMBO_MAIN
const simpleProducts = computed(() => {
  const related = props.group.relatedProducts || props.group.getRelatedProducts?.() || []
  return related.filter((item: any) => {
    const type = item.productType || item.getProductType?.()
    return type === 'SIMPLE'
  })
})

// Track the current nested selections
let currentNestedSelections: Record<string, any> = {}

function getItemId(item: any): string {
  return item.id || item.getId?.() || ''
}

function handleNestedSelections(itemId: string, selections: Record<string, any>) {
  currentNestedSelections = selections

  // Check if all mandatory selections are valid
  const allValid = Object.entries(selections).every(([key, sel]: [string, any]) => {
    // If the selection has a mandatory flag and it's true, check if it's valid
    if (sel.mandatory) {
      return sel.valid === true
    }
    // Non-mandatory selections are always considered valid
    return true
  })

  // Auto-select the SIMPLE product and pass through its selections
  emit('update:selection', {
    value: itemId,
    nestedSelections: selections,
    valid: allValid,
    price: calculateTotalPrice(selections)
  })
}

function calculateTotalPrice(selections: Record<string, any>): number {
  let totalPrice = 0

  Object.values(selections).forEach((sel: any) => {
    if (sel.price) {
      totalPrice += sel.price
    }
  })

  return totalPrice
}

function validateSelections(selections: Record<string, any>): boolean {
  return Object.entries(selections).every(([key, sel]: [string, any]) => {
    // Check mandatory selections are valid
    if (sel.mandatory) {
      return sel.valid === true
    }
    return true
  })
}

// Auto-select the first (usually only) SIMPLE product and emit initial state
onMounted(() => {
  if (simpleProducts.value.length === 1) {
    const item = simpleProducts.value[0]
    const itemId = getItemId(item)

    // Emit initial selection with empty nested selections
    // This ensures the parent knows about this group
    emit('update:selection', {
      value: itemId,
      nestedSelections: {},
      valid: false, // Start as invalid until nested selections are made
      price: 0
    })
  }
})

// Watch for changes in simpleProducts (in case they load asynchronously)
watch(simpleProducts, (newProducts) => {
  if (newProducts.length === 1 && !currentNestedSelections) {
    const item = newProducts[0]
    const itemId = getItemId(item)

    emit('update:selection', {
      value: itemId,
      nestedSelections: {},
      valid: false,
      price: 0
    })
  }
}, { immediate: true })
</script>
