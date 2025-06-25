<template>
  <div class="configuration-renderer space-y-4">
    <!-- Special handling for top-level COMBO structure -->
    <template v-if="isComboProduct">
      <!-- COMBO_MAIN section -->
      <div v-for="mainGroup in comboMainGroups" :key="getGroupId(mainGroup)">
        <ComboMainSelector
          :group="mainGroup"
          @update:selection="handleSelection(getGroupId(mainGroup), $event)"
        />
      </div>

      <!-- COMBO_SIDE sections -->
      <div v-for="sideGroup in comboSideGroups" :key="getGroupId(sideGroup)">
        <ComboSideSelector
          :group="sideGroup"
          :quantity="sideGroup.quantity || 1"
          @update:selection="handleSelection(getGroupId(sideGroup), $event)"
        />
      </div>
    </template>

    <!-- Regular product configuration -->
    <template v-else>
      <div v-for="group in topLevelGroups" :key="getGroupId(group)" class="config-group">
        <component
          :is="getComponentForGroup(group)"
          :group="group"
          v-bind="getPropsForGroup(group)"
          @update:selection="handleSelection(getGroupId(group), $event)"
        />

        <!-- Nested configurations for selected items -->
        <div
          v-if="hasNestedConfig(group) && isGroupSelected(group)"
          class="ml-8 mt-4 border-l-2 border-yellow-500 pl-4 space-y-4"
        >
          <ConfigurationRenderer
            :product="getSelectedProduct(group)"
            @update:selections="handleNestedSelections(getGroupId(group), $event)"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useProductConfigStrategy } from '../composables/useProductConfigStrategy.ts'
import OptionSelector from './configurators/OptionSelector.vue'
import ComboMainSelector from './configurators/ComboMainSelector.vue'
import ComboSideSelector from './configurators/ComboSideSelector.vue'

const props = defineProps<{
  product: any
  itemClass?: string
  contentClass?: string
}>()

const emit = defineEmits<{
  'update:selections': [value: Record<string, any>]
}>()

const { getStrategy } = useProductConfigStrategy()
const selections = ref<Record<string, any>>({})

// Check if this is a COMBO product
const isComboProduct = computed(() => {
  const type = props.product?.productType || props.product?.getProductType?.()
  return type === 'COMBO'
})

// Separate COMBO_MAIN and COMBO_SIDE groups
const comboMainGroups = computed(() => {
  if (!isComboProduct.value) return []
  const groups = props.product?.relatedProducts || props.product?.getRelatedProducts?.() || []
  return groups.filter((g: any) => (g.productType || g.getProductType?.()) === 'COMBO_MAIN')
})

const comboSideGroups = computed(() => {
  if (!isComboProduct.value) return []
  const groups = props.product?.relatedProducts || props.product?.getRelatedProducts?.() || []
  return groups.filter((g: any) => (g.productType || g.getProductType?.()) === 'COMBO_SIDE')
})

// Regular groups for non-combo products
const topLevelGroups = computed(() => {
  if (isComboProduct.value) return []

  const groups = props.product?.relatedProducts || props.product?.getRelatedProducts?.() || []

  // Flatten "How d'ya like it?" groups
  const flattened: any[] = []
  groups.forEach((group: any) => {
    const name = group.name || group.getName?.() || ''
    if (name.toLowerCase() === "how d'ya like it?") {
      const children = group.relatedProducts || group.getRelatedProducts?.() || []
      flattened.push(...children)
    } else {
      flattened.push(group)
    }
  })

  return flattened
})

function getGroupId(group: any): string {
  return group.id || group.getId?.() || ''
}

function getComponentForGroup(group: any) {
  const strategy = getStrategy(group)
  return strategy?.getComponent() || OptionSelector
}

function getPropsForGroup(group: any) {
  const strategy = getStrategy(group)
  const baseProps = strategy?.getProps(group, { selections: selections.value }) || {}

  // Add mandatory flag to props
  return {
    ...baseProps,
    mandatory: group.mandatory || group.isMandatory?.() || false
  }
}

function hasNestedConfig(group: any): boolean {
  const type = group.productType || group.getProductType?.()
  if (type === 'SIMPLE') {
    const related = group.relatedProducts || group.getRelatedProducts?.() || []
    return related.length > 0
  }
  return false
}

function isGroupSelected(group: any): boolean {
  const groupId = getGroupId(group)
  const selection = selections.value[groupId]
  return !!(selection?.value || selection)
}

function getSelectedProduct(group: any) {
  const groupId = getGroupId(group)
  const selectionValue = selections.value[groupId]?.value || selections.value[groupId]

  if (selectionValue) {
    const related = group.relatedProducts || group.getRelatedProducts?.() || []
    return related.find((item: any) => (item.id || item.getId?.()) === selectionValue)
  }
  return null
}

function handleSelection(groupId: string, selection: any) {
  // Store the selection with mandatory flag from the group
  const group = findGroupById(groupId)
  const isMandatory = group?.mandatory || group?.isMandatory?.() || false

  selections.value[groupId] = {
    ...selection,
    mandatory: isMandatory
  }

  // Always emit the current state
  emitSelections()
}

function findGroupById(groupId: string): any {
  const allGroups = [
    ...comboMainGroups.value,
    ...comboSideGroups.value,
    ...topLevelGroups.value
  ]
  return allGroups.find(g => getGroupId(g) === groupId)
}

function handleNestedSelections(parentGroupId: string, nestedSelections: Record<string, any>) {
  // Merge nested selections into the parent's selection
  if (selections.value[parentGroupId]) {
    selections.value[parentGroupId].nestedSelections = nestedSelections
  }

  emitSelections()
}

function emitSelections() {
  if (!isComboProduct.value) {
    // For regular products, emit selections as-is
    emit('update:selections', selections.value)
  } else {
    // For combo products, emit with proper structure
    emitComboSelections()
  }
}

function emitComboSelections() {
  // For combo products, we emit all selections including nested ones
  const comboSelections: Record<string, any> = {}

  // Add COMBO_MAIN selections
  comboMainGroups.value.forEach((mainGroup) => {
    const mainId = getGroupId(mainGroup)
    const mainSelection = selections.value[mainId]
    if (mainSelection) {
      comboSelections[mainId] = mainSelection
    }
  })

  // Add COMBO_SIDE selections
  comboSideGroups.value.forEach((sideGroup) => {
    const sideId = getGroupId(sideGroup)
    const sideSelection = selections.value[sideId]
    if (sideSelection) {
      comboSelections[sideId] = sideSelection
    }
  })

  emit('update:selections', comboSelections)
}

// Watch for product changes and reset selections
watch(() => props.product, () => {
  selections.value = {}
}, { deep: true })
</script>
