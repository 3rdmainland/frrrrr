<template>
  <div class="flavor-configurator">
    <!-- Desktop/Tablet View - Accordion -->
    <NAccordion v-if="!isMobileView" :items="[accordionItem]">
      <!-- Header -->
      <template #[`title-${groupId}`]>
        <div class="flex items-center justify-between w-full">
          <span class="text-nandos-fresh-white">{{ groupName }}</span>
          <div class="flex items-center gap-2">
            <NTag v-if="selectedDisplay" variant="selected" class="bg-yellow-500 text-black">
              {{ selectedDisplay }}
            </NTag>
            <NTag v-if="isMandatory" required> Required </NTag>
          </div>
        </div>
      </template>

      <!-- Content -->
      <template #[`content-${groupId}`]>
        <div class="flex flex-col items-center p-4">
          <!-- NPeriometer for visual flavor selection -->
          <NPeriometer
            v-if="showPeriometer"
            :flavour1="selection.flavour1"
            :flavour2="selection.flavour2"
            :half-and-half="selection.halfAndHalf"
            :selectable-flavours="availableFlavourCodes"
            @update:flavour1="handleFlavorUpdate('flavour1', $event)"
            @update:flavour2="handleFlavorUpdate('flavour2', $event)"
            class="mb-4"
          />

          <!-- Half & Half Toggle -->
          <button
            v-if="supportsHalfAndHalf && showPeriometer"
            @click="toggleHalfAndHalf"
            class="mt-4 px-4 py-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-black transition"
          >
            {{ selection.halfAndHalf ? 'Single Flavour' : 'Half & Half' }}
          </button>

          <!-- List view with NRadioInput -->
          <div v-if="!showPeriometer" class="w-full space-y-2">
            <div
              v-for="flavor in availableFlavors"
              :key="flavor.id"
              class="p-3 rounded-lg hover:bg-gray-100 cursor-pointer border"
              :class="{ 'border-yellow-500 bg-[#111111]': selectedFlavorId === flavor.id }"
            >
              <NRadioInput
                v-model="selectedFlavorId"
                :id="`flavor-${flavor.id}`"
                :name="`flavor-${groupId}`"
                :value="flavor.id"
                :label="flavor.name"
                labelClasses="!mb-0"
              />
            </div>
          </div>
        </div>
      </template>
    </NAccordion>

    <!-- Mobile View - Clickable Row -->
    <div v-else>
      <div
        @click="showDrawer = true"
        class="py-[13px] px-[27px] mb-3 rounded-[24px] shadow-sm bg-nandos-black flex items-center justify-between cursor-pointer transition-colors duration-300 text-white text-xl"
      >
        <div class="flex items-center gap-2">
          <span class="text-nandos-fresh-white text-lg">{{ groupName }} </span>
          <NTag v-if="selectedDisplay" variant="selected" class="bg-yellow-500 text-black flex-1/6">
            {{ selectedDisplay }}
          </NTag>
          <NTag v-else v-if="isMandatory" required> Required </NTag>
        </div>
        <NIcon icon="arrow-right" size="sm" />
      </div>
      <!-- Mobile Drawer -->
      <MobileDrawer
        v-model="showDrawer"
        :title="groupName"
        :drawer-class="'bg-[#111111]'"
        :handle-class="'bg-gray-300'"
        :show-header="false"
        :close-delay="300"
      >
        <div class="flex flex-col items-center">
          <!-- Periometer View -->
          <div v-if="showPeriometer" class="w-full max-w-sm mx-auto">
            <NPeriometer
              :flavour1="selection.flavour1"
              :flavour2="selection.flavour2"
              :half-and-half="selection.halfAndHalf"
              :selectable-flavours="availableFlavourCodes"
              @update:flavour1="handleFlavorUpdate('flavour1', $event)"
              @update:flavour2="handleFlavorUpdate('flavour2', $event)"
              class="mb-6"
            />

            <!-- Half & Half Toggle -->
            <div class="flex justify-around items-center">
              <NButton
                rounded
                size="sm"
                variant="secondary"
                v-if="supportsHalfAndHalf"
                @click="toggleHalfAndHalf"
                :class="
                  selection.halfAndHalf
                    ? 'bg-nandos-pink hover:bg-pink-600 !rounded-full'
                    : 'bg-nandos-yellow hover:bg-gray-400 !rounded-full'
                "
              >
                <span class="text-sm font-medium leading-tight text-black">
                  <template v-if="selection.halfAndHalf"> Half &<br />Half </template>
                  <template v-else> Single<br />flavor </template>
                </span>
              </NButton>
              <NButton size="sm" variant="secondary" @click="handleCloseDrawer" class="h-fit p-2">
                Done
              </NButton>
              <NButton
                rounded
                size="sm"
                variant="secondary"
                @click="selectNoSauce"
                class="bg-gray-300 hover:bg-gray-400 !rounded-full text-black text-sm font-medium"
              >
                No Sauce
              </NButton>
            </div>
          </div>

          <!-- List View -->
          <div v-else class="w-full space-y-2">
            <label
              v-for="flavor in availableFlavors"
              :key="flavor.id"
              class="flex items-center p-4 rounded-lg hover:bg-gray-100 cursor-pointer transition text-black"
              :class="{ 'bg-gray-100': selectedFlavorId === flavor.id }"
            >
              <input
                type="radio"
                :name="`flavor-${groupId}`"
                :value="flavor.id"
                v-model="selectedFlavorId"
                class="mr-3"
              />
              <span class="flex-1 font-medium">{{ flavor.name }}</span>
            </label>

            <!-- No Sauce Option -->
            <label
              class="flex items-center p-4 rounded-lg hover:bg-gray-100 cursor-pointer transition text-black"
              :class="{ 'bg-gray-100': selectedFlavorId === '' }"
            >
              <input
                type="radio"
                :name="`flavor-${groupId}`"
                value=""
                v-model="selectedFlavorId"
                class="mr-3"
              />
              <span class="flex-1 font-medium">No Sauce</span>
            </label>
          </div>
        </div>
      </MobileDrawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted, onUnmounted } from 'vue'
import { NAccordion, NTag, NPeriometer, NRadioInput, NButton, NIcon } from 'nandos-core-ui-v2'
import MobileDrawer from '@/components/drawer/MobileDrawer.vue'

const props = defineProps<{
  group: any
  supportsHalfAndHalf?: boolean
  showPeriometer?: boolean
}>()

const emit = defineEmits<{
  'update:selection': [value: any]
}>()

// Mobile detection
const isMobileView = ref(false)
const showDrawer = ref(false)
const isNoSauce = ref(false)

// Group info
const groupId = computed(() => props.group.id || props.group.getId?.() || '')
const groupName = computed(() => props.group.name || props.group.getName?.() || '')
const isMandatory = computed(() => props.group.mandatory || props.group.isMandatory?.() || false)

// Selection state
const selection = reactive({
  flavour1: '',
  flavour2: '',
  halfAndHalf: false, // Default to single flavor
})

// Radio input v-model for list view
const selectedFlavorId = ref('')

// Available flavors
const availableFlavors = computed(() => {
  const related = props.group.relatedProducts || props.group.getRelatedProducts?.() || []
  return related
    .filter((p: any) => {
      const type = p.productType || p.getProductType?.()
      return type === 'CONDIMENT'
    })
    .map((p: any) => ({
      id: p.id || p.getId?.(),
      name: p.name || p.getName?.(),
      code: (p.name || p.getName?.() || '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9-]/g, ''),
    }))
})

const availableFlavourCodes = computed(() => availableFlavors.value.map((f) => f.code))

const selectedDisplay = computed(() => {
  if (selection.halfAndHalf && selection.flavour1 && selection.flavour2) {
    const f1 = findFlavorByCode(selection.flavour1)?.name
    const f2 = findFlavorByCode(selection.flavour2)?.name
    return `${f1} / ${f2}`
  }
  if (selection.flavour1) {
    return findFlavorByCode(selection.flavour1)?.name
  }
  return ''
})

const accordionItem = computed(() => ({
  id: groupId.value,
  title: groupName.value,
  expanded: isMandatory.value,
}))

// Mobile detection
function checkMobile() {
  isMobileView.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Watch for changes in radio selection
watch(selectedFlavorId, (newId) => {
  if (newId) {
    const flavor = findFlavorById(newId)
    if (flavor) {
      selectFlavor(flavor)
    }
  } else {
    selectNoSauce()
  }
})

watch(
  () => selection.flavour1,
  (newValue) => {
    if (!props.showPeriometer) {
      const flavor = findFlavorByCode(newValue)
      selectedFlavorId.value = flavor?.id || newValue || ''
    }
  },
  { immediate: true },
)

function findFlavorByCode(code: string) {
  return availableFlavors.value.find((f) => f.code === code || f.id === code)
}

function findFlavorById(id: string) {
  return availableFlavors.value.find((f) => f.id === id)
}

function handleCloseDrawer() {
  showDrawer.value = false
}

function selectFlavor(flavor: any) {
  selection.flavour1 = props.showPeriometer ? flavor.code : flavor.id
  selection.flavour2 = ''
  selection.halfAndHalf = false
  emitSelection()

  // Close drawer immediately when selecting a flavor in single mode
  if (!props.showPeriometer) {
    handleCloseDrawer()
  }
}

function selectNoSauce() {
  selection.flavour1 = ''
  selection.flavour2 = ''
  selection.halfAndHalf = false
  selectedFlavorId.value = ''
  emitSelection()
  isNoSauce.value = true

  // Close drawer immediately when selecting no sauce
  handleCloseDrawer()
}

function handleFlavorUpdate(field: 'flavour1' | 'flavour2', code: string) {
  selection[field] = code

  if (!selection.halfAndHalf && field === 'flavour1') {
    selection.flavour2 = ''
  }

  emitSelection()

  if (props.showPeriometer) {
    if (!selection.halfAndHalf && field === 'flavour1' && code) {
      handleCloseDrawer()
    } else if (selection.halfAndHalf && field === 'flavour2' && code) {
      handleCloseDrawer()
    }
  }
}

function toggleHalfAndHalf() {
  selection.halfAndHalf = !selection.halfAndHalf
  if (!selection.halfAndHalf) {
    selection.flavour2 = ''
  }
  emitSelection()
}

function emitSelection() {
  let value: string | string[]

  if (props.showPeriometer) {
    value = selection.halfAndHalf
      ? [selection.flavour1, selection.flavour2].filter(Boolean)
      : selection.flavour1
  } else {
    const id1 = findFlavorByCode(selection.flavour1)?.id || selection.flavour1
    const id2 = findFlavorByCode(selection.flavour2)?.id || selection.flavour2
    value = selection.halfAndHalf ? [id1, id2].filter(Boolean) : id1
  }

  emit('update:selection', {
    value,
    halfAndHalf: selection.halfAndHalf,
    valid: validateSelection(),
    price: 0,
  })
}

function validateSelection(): boolean {
  if (isMandatory.value) {
    if (selection.halfAndHalf) {
      return !!(selection.flavour1 && selection.flavour2)
    }
    return !!selection.flavour1
  }
  return true
}
</script>
