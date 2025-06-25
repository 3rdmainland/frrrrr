<template>
  <NAccordion :items="[accordionItem]" content-class="p-0 m-0">
    <!-- Header -->
    <template #[`title-${groupId}`]>
      <div class="flex items-center justify-between w-full">
        <span class="text-nandos-fresh-white text-lg font-medium">{{ groupName }}</span>
        <NTag v-if="isMandatory" required> Required </NTag>
      </div>
    </template>

    <!-- Content -->
    <template #[`content-${groupId}`]>
      <div class="space-y-2 py-4">
        <div v-for="child in children" :key="getChildId(child)" class="container-child" >
          <component
            :is="getComponentForChild(child)"
            :group="child"
            :parentGroup="group"
            :initialValue="getInitialValue(child)"
            v-bind="getPropsForChild(child)"
            @update:selection="handleChildSelection(getChildId(child), $event)"
          />
        </div>
      </div>
    </template>
  </NAccordion>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { NAccordion, NTag } from 'nandos-core-ui-v2'
import { useProductConfigStrategy } from '../../composables/useProductConfigStrategy.ts'
import OptionSelector from './OptionSelector.vue'

const props = defineProps<{
  group: any
  expanded?: boolean
  selections?: Record<string, any>  // Add this prop to receive selections from parent
}>()

const emit = defineEmits<{
  'update:selection': [value: any]
}>()

const { getStrategy } = useProductConfigStrategy()

// Group info
const groupId = computed(() => props.group.id || props.group.getId?.() || '')
const groupName = computed(() => props.group.name || props.group.getName?.() || '')
const isMandatory = computed(() => props.group.mandatory || props.group.isMandatory?.() || false)

// Children
const children = computed(() => {
  return props.group.relatedProducts || props.group.getRelatedProducts?.() || []
})

const accordionItem = computed(() => ({
  id: groupId.value,
  title: groupName.value,
  expanded: props.expanded || isMandatory.value,
}))

// Selection tracking - initialize with parent selections if provided
const childSelections = ref<Record<string, any>>(props.selections || {})

function getChildId(child: any): string {
  return child.id || child.getId?.() || ''
}

function getInitialValue(child: any): any {
  const childId = getChildId(child)
  const selection = childSelections.value[childId]
  return selection?.value || null
}

function getComponentForChild(child: any) {
  const strategy = getStrategy(child)
  return strategy?.getComponent() || OptionSelector
}

function getPropsForChild(child: any) {
  const strategy = getStrategy(child)
  const baseProps = strategy?.getProps(child, { selections: childSelections.value }) || {}

  // For container children, determine if multiple selection is allowed
  if (!strategy) {
    return {
      ...baseProps,
      multiple: !isMandatory.value,
    }
  }

  return baseProps
}

function handleChildSelection(childId: string, selection: any) {
  childSelections.value[childId] = selection

  // For mandatory containers, emit the selected child's value
  // For optional containers, emit array of selected values
  if (isMandatory.value) {
    const selectedValue = selection.value
    emit('update:selection', {
      value: selectedValue,
      valid: !!selectedValue,
      price: selection.price || 0,
      selections: childSelections.value  // Pass selections up
    })
  } else {
    const selectedValues = Object.entries(childSelections.value)
      .filter(([_, sel]) => sel.value && sel.value.length > 0)
      .map(([id, _]) => id)

    const totalPrice = Object.values(childSelections.value).reduce(
      (sum, sel: any) => sum + (sel.price || 0),
      0,
    )

    emit('update:selection', {
      value: selectedValues,
      valid: true,
      price: totalPrice,
      selections: childSelections.value  // Pass selections up
    })
  }
}
</script>
