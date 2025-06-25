<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div v-if="isVisible" class="fixed inset-0 z-50 flex items-end">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black transition opacity-25"
          :class="backdropClass"
          @click="handleClose"
        />

        <!-- Drawer Content -->
        <div
          class="relative w-full rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col pt-2"
          :class="drawerClass"
          @click.stop
        >
          <!-- Handle Bar -->
          <div v-if="showHandle" class="flex justify-center py-2">
            <div class="w-12 h-1 rounded-full" :class="handleClass" />
          </div>

          <!-- Header -->
          <div v-if="showHeader && (title || $slots.header)" class="px-4 pb-2">
            <slot name="header">
              <h2 v-if="title" class="text-lg font-semibold" :class="titleClass">
                {{ title }}
              </h2>
            </slot>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto px-4 py-4" :class="contentClass">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer || showDoneButton"
            class="px-4 py-4 border-t"
            :class="footerClass"
          >
            <slot name="footer">
              <button
                v-if="showDoneButton"
                @click="handleDone"
                class="w-full py-3 rounded-lg font-medium transition"
                :class="doneButtonClass"
              >
                {{ doneButtonText }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  showHandle?: boolean
  showHeader?: boolean
  showDoneButton?: boolean
  doneButtonText?: string
  preventBodyScroll?: boolean
  closeDelay?: number
  backdropClass?: string
  drawerClass?: string
  handleClass?: string
  titleClass?: string
  contentClass?: string
  footerClass?: string
  doneButtonClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showHandle: true,
  showHeader: true,
  showDoneButton: false,
  doneButtonText: 'Done',
  preventBodyScroll: true,
  closeDelay: 0,
  backdropClass: 'bg-opacity-50',
  drawerClass: 'bg-white dark:bg-gray-900',
  handleClass: 'bg-gray-300 dark:bg-gray-700',
  titleClass: 'text-gray-900 dark:text-white',
  contentClass: '',
  footerClass: 'border-gray-200 dark:border-gray-700',
  doneButtonClass: 'bg-blue-500 hover:bg-blue-600 text-white',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  done: []
}>()

const isVisible = ref(props.modelValue)
const closeTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const isClosing = ref(false)

function clearCloseTimeout() {
  if (closeTimeout.value) {
    clearTimeout(closeTimeout.value)
    closeTimeout.value = null
  }
}

function scheduleClose() {
  clearCloseTimeout()
  isClosing.value = true

  if (props.closeDelay > 0) {
    closeTimeout.value = setTimeout(() => {
      isVisible.value = false
      isClosing.value = false
      emit('update:modelValue', false)
      emit('close')
    }, props.closeDelay)
  } else {
    isVisible.value = false
    isClosing.value = false
    emit('update:modelValue', false)
    emit('close')
  }
}

function handleClose() {
  scheduleClose()
}

function handleDone() {
  emit('done')
  scheduleClose()
}

function closeImmediate() {
  clearCloseTimeout()
  isClosing.value = false
  isVisible.value = false
  emit('update:modelValue', false)
  emit('close')
}

watch(() => props.modelValue, (newValue) => {
  if (newValue && !isVisible.value) {
    clearCloseTimeout()
    isClosing.value = false
    isVisible.value = true
  } else if (!newValue && isVisible.value && !isClosing.value) {
    scheduleClose()
  }
})

watch(isVisible, (newValue) => {
  if (props.preventBodyScroll) {
    document.body.style.overflow = newValue ? 'hidden' : ''
  }
})

onUnmounted(() => {
  clearCloseTimeout()
  if (props.preventBodyScroll) {
    document.body.style.overflow = ''
  }
})

defineExpose({
  closeImmediate,
})
</script>
