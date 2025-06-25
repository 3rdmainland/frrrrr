<template>
  <NAccordion :items="[accordionItem]" content-class="py-6 text-white">
    <!-- Header -->
    <template #[`title-${groupId}`]>
      <div class="flex items-center justify-between w-full">
        <span class="text-nandos-fresh-white font-medium">{{ groupName }}</span>
        <div class="flex items-center gap-2">
          <NTag variant="info">
            {{ selectedCount }} / {{ allowedSelections }} selected
          </NTag>
          <NTag v-if="isMandatory" required>
            Required
          </NTag>
        </div>
      </div>
    </template>

    <!-- Content -->
    <template #[`content-${groupId}`]>
      <div class="space-y-4">
        <div
          v-for="item in availableItems"
          :key="getItemId(item)"
          class="combo-side-item"
        >
          <!-- Simple items -->
          <NCheckbox
            v-if="!hasNestedOptions(item)"
            :id="getItemId(item) + '-checkbox'"
            v-model="selectedItemsMap[getItemId(item)]"
            :name="getItemName(item)"
            :label="getItemName(item)"
            :disabled="!isItemSelected(item) && selectedCount >= allowedSelections && allowedSelections > 1"
            class="mr-3"
            @update:model-value="handleItemSelection(getItemId(item), $event)"
          />

          <!-- Items with nested options -->
          <div v-else class="space-y-2">
            <NCheckbox
              :id="getItemId(item) + '-checkbox'"
              v-model="selectedItemsMap[getItemId(item)]"
              :name="getItemName(item)"
              :label="getItemName(item)"
              :disabled="!isItemSelected(item) && selectedCount >= allowedSelections && allowedSelections > 1"
              class="mr-3"
              @update:model-value="handleItemSelection(getItemId(item), $event)"
            />

            <!-- Nested options -->
            <div
              v-if="isItemSelected(item)"
              class="ml-6 space-y-2"
            >
              <ConfigurationRenderer
                :product="item"
                @update:selections="handleNestedSelections(getItemId(item), $event)"
                item-class=""
                content-class=""
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </NAccordion>
</template>

<script setup lang="ts">
import { computed, ref, watch, reactive } from 'vue'
import { NAccordion, NCheckbox, NTag } from 'nandos-core-ui-v2'
import ConfigurationRenderer from '../ConfigurationRenderer.vue'
import { formatCurrency } from 'nandos-i18n-v2'

const props = defineProps<{
  group: any
  allowedSelections?: number
  quantity?: number
}>()

const emit = defineEmits<{
  'update:selection': [value: any]
}>()

// Group info
const groupId = computed(() => props.group.id || props.group.getId?.() || '')
const groupName = computed(() => props.group.name || props.group.getName?.() || '')
const isMandatory = computed(() => props.group.mandatory || props.group.isMandatory?.() || false)
const allowedSelections = computed(() =>
  props.allowedSelections || props.quantity || props.group.quantity || 1
)

// Selection state - using reactive map for checkbox binding
const selectedItemsMap = reactive<Record<string, boolean>>({})
const nestedSelections = ref<Record<string, any>>({})

// Computed values
const selectedItems = computed(() =>
  Object.keys(selectedItemsMap).filter(key => selectedItemsMap[key])
)

const selectedCount = computed(() => selectedItems.value.length)

const availableItems = computed(() => {
  const related = props.group.relatedProducts || props.group.getRelatedProducts?.() || []
  return related.filter((item: any) => {
    const type = item.productType || item.getProductType?.()
    return type === 'SIMPLE'
  })
})

const accordionItem = computed(() => ({
  id: groupId.value,
  title: groupName.value,
  expanded: isMandatory.value
}))

// Initialize selectedItemsMap for all available items
watch(availableItems, (newItems) => {
  newItems.forEach((item: any) => {
    const itemId = getItemId(item)
    if (!(itemId in selectedItemsMap)) {
      selectedItemsMap[itemId] = false
    }
  })
}, { immediate: true })

// Track selection order for smart deselection (only needed when allowedSelections > 1)
const selectionOrder = ref<string[]>([])

// Handle item selection with radio button behavior when allowedSelections is 1
function handleItemSelection(itemId: string, isSelected: boolean) {
  if (isSelected && allowedSelections.value === 1) {
    // Radio button behavior: deselect all other items
    Object.keys(selectedItemsMap).forEach(key => {
      if (key !== itemId) {
        selectedItemsMap[key] = false
      }
    })
  }
  // The v-model will handle updating selectedItemsMap[itemId]
}

// Watch for changes in selection and enforce limits
watch(selectedItemsMap, (newMap, oldMap) => {
  const selectedKeys = Object.keys(newMap).filter(key => newMap[key])

  // Only track selection order when allowedSelections > 1
  if (allowedSelections.value > 1) {
    // Update selection order
    Object.keys(newMap).forEach(key => {
      const wasSelected = oldMap?.[key] || false
      const isSelected = newMap[key]

      if (!wasSelected && isSelected) {
        // Item was just selected - add to end of order
        selectionOrder.value.push(key)
      } else if (wasSelected && !isSelected) {
        // Item was just deselected - remove from order
        const index = selectionOrder.value.indexOf(key)
        if (index > -1) {
          selectionOrder.value.splice(index, 1)
        }
      }
    })

    // If we exceed the allowed selections, deselect the oldest selection
    if (selectedKeys.length > allowedSelections.value) {
      const oldestSelection = selectionOrder.value[0]
      selectedItemsMap[oldestSelection] = false
      selectionOrder.value.shift() // Remove from order tracking
    }
  }

  // Clean up nested selections for unselected items
  Object.keys(nestedSelections.value).forEach(itemId => {
    if (!newMap[itemId]) {
      delete nestedSelections.value[itemId]
    }
  })

  emitSelection()
}, { deep: true })

function getItemId(item: any): string {
  return item.id || item.getId?.() || ''
}

function getItemName(item: any): string {
  return item.name || item.getName?.() || ''
}

function getItemPrice(item: any): number {
  return item.price || item.getPrice?.() || 0
}

function hasNestedOptions(item: any): boolean {
  const related = item.relatedProducts || item.getRelatedProducts?.() || []
  return related.length > 0
}

function isItemSelected(item: any): boolean {
  return selectedItemsMap[getItemId(item)] || false
}

function handleNestedSelections(itemId: string, selections: Record<string, any>) {
  nestedSelections.value[itemId] = selections
  emitSelection()
}

function emitSelection() {
  const selectedItemsList = selectedItems.value
  const valid = selectedItemsList.length === allowedSelections.value

  // Calculate total price including nested selections
  let totalPrice = 0
  selectedItemsList.forEach(itemId => {
    const item = availableItems.value.find((i: any) => getItemId(i) === itemId)
    if (item) {
      totalPrice += getItemPrice(item)
    }

    // Add nested selection prices
    const nested = nestedSelections.value[itemId]
    if (nested) {
      Object.values(nested).forEach((selection: any) => {
        if (selection.price) {
          totalPrice += selection.price
        }
      })
    }
  })

  emit('update:selection', {
    value: selectedItemsList,
    nestedSelections: nestedSelections.value,
    valid,
    price: totalPrice
  })
}
</script>
