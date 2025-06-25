<template>
  <div class="option-selector mb-2">
    <div
      class="p-3 rounded-lg hover:bg-gray-100 hover:text-nandos-black cursor-pointer border transition-colors"
      @click="handleRowClick"
    >
      <!-- Single selection with NRadioInput -->
      <NRadioInput
        v-if="!multiple"
        v-model="singleValue"
        :id="`option-${itemId}`"
        :name="`option-${groupId}`"
        :value="itemId"
        :label="itemName"
        labelClasses="!mb-0 text-nandos-fresh-white pointer-events-none"
      />

      <!-- Multiple selection with NCheckbox -->
      <NCheckbox
        v-else
        v-model="multipleValues[itemId]"
        :id="`option-${itemId}`"
        :name="itemName"
        :label="itemName"
        labelClasses="text-nandos-fresh-white pointer-events-none"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch, onMounted } from 'vue'
import { NRadioInput, NCheckbox } from 'nandos-core-ui-v2'

const props = defineProps<{
  group: any
  parentGroup?: any
  multiple?: boolean
  initialValue?: any  // Add this prop to receive initial state
}>()

const emit = defineEmits<{
  'update:selection': [value: any]
}>()

// Extract IDs and properties
const groupId = computed(
  () =>
    props.parentGroup?.id ||
    props.parentGroup?.getId?.() ||
    props.group.id ||
    props.group.getId?.() ||
    '',
)
const itemId = computed(() => props.group.id || props.group.getId?.() || '')
const itemName = computed(() => props.group.name || props.group.getName?.() || '')
const price = computed(() => props.group.price || props.group.getPrice?.() || 0)

// State for single selection (radio)
const singleValue = ref('')

// State for multiple selection (checkbox)
const multipleValues = reactive<Record<string, boolean>>({})

// Initialize state from props
onMounted(() => {
  if (props.initialValue) {
    if (props.multiple) {
      // For multiple selection, initialValue should be an array
      if (Array.isArray(props.initialValue)) {
        props.initialValue.forEach(id => {
          multipleValues[id] = true
        })
      }
    } else {
      // For single selection, initialValue should be a string
      singleValue.value = props.initialValue || ''
    }
  }
})

// Initialize checkbox state
if (props.multiple && !(itemId.value in multipleValues)) {
  multipleValues[itemId.value] = false
}

// Computed property to check if this item is selected
const isSelected = computed(() => {
  if (props.multiple) {
    return multipleValues[itemId.value] || false
  }
  return singleValue.value === itemId.value
})

// Handle row click
const handleRowClick = (event: MouseEvent) => {
  // Prevent double-triggering if clicking directly on the input
  if ((event.target as HTMLElement).tagName === 'INPUT') {
    return
  }

  if (props.multiple) {
    // Toggle checkbox
    multipleValues[itemId.value] = !multipleValues[itemId.value]
  } else {
    // Set radio value
    singleValue.value = itemId.value
  }
}

// Watch for single selection changes
watch(singleValue, (newValue) => {
  if (!props.multiple) {
    emit('update:selection', {
      value: newValue,
      valid: true,
      price: newValue === itemId.value ? price.value : 0,
    })
  }
})

// Watch for multiple selection changes
watch(
  multipleValues,
  () => {
    if (props.multiple) {
      // Get all selected item IDs
      const selectedIds = Object.entries(multipleValues)
        .filter(([_, isChecked]) => isChecked)
        .map(([id]) => id)

      // Calculate if this specific item contributes to the price
      const itemPrice = multipleValues[itemId.value] ? price.value : 0

      emit('update:selection', {
        value: selectedIds,
        valid: true,
        price: itemPrice,
      })
    }
  },
  { deep: true },
)
</script>
