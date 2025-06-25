<template>
  <button
    type="button"
    class="speech-to-text-button"
    @click="startListening"
    :disabled="isListening || !isAvailable"
  >
    <span class="material-icons">{{ isListening ? 'mic' : 'mic_none' }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  language: {
    type: String,
    default: 'en-US'
  },
  continuous: {
    type: Boolean,
    default: false
  },
  interimResults: {
    type: Boolean,
    default: true
  },
  maxAlternatives: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['input', 'error', 'is-available'])

const isAvailable = ref(false)
const isListening = ref(false)
const recognition = ref<any>(null)
const modelValue = ref({ text: '', isFinal: true })

// Check if browser supports speech recognition
onMounted(() => {
  try {
    // @ts-ignore - SpeechRecognition is not in the TypeScript types
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      recognition.value = new SpeechRecognition()
      recognition.value.continuous = props.continuous
      recognition.value.interimResults = props.interimResults
      recognition.value.maxAlternatives = props.maxAlternatives
      recognition.value.lang = props.language

      // Set up event handlers
      recognition.value.onresult = handleResult
      recognition.value.onerror = handleError
      recognition.value.onend = handleEnd

      isAvailable.value = true
    } else {
      isAvailable.value = false
    }
  } catch (e) {
    isAvailable.value = false
  }

  emit('is-available', isAvailable.value)
})

// Update language when prop changes
watch(() => props.language, (newLang) => {
  if (recognition.value) {
    recognition.value.lang = newLang
  }
})

// Handle speech recognition result
const handleResult = (event: any) => {
  const result = event.results[event.results.length - 1]
  const transcript = result[0].transcript

  modelValue.value = {
    text: transcript,
    isFinal: result.isFinal
  }

  emit('input', modelValue.value)

  if (result.isFinal && !props.continuous) {
    stopListening()
  }
}

// Handle speech recognition error
const handleError = (event: any) => {
  stopListening()
  emit('error', event.error)
}

// Handle speech recognition end
const handleEnd = () => {
  isListening.value = false
}

// Start listening
const startListening = () => {
  if (!recognition.value || isListening.value) return

  try {
    recognition.value.start()
    isListening.value = true
    modelValue.value = { text: '', isFinal: true }
  } catch (e) {
    emit('error', 'unavailable')
  }
}

// Stop listening
const stopListening = () => {
  if (!recognition.value || !isListening.value) return

  try {
    recognition.value.stop()
    isListening.value = false
  } catch (e) {
    // Ignore errors when stopping
  }
}
</script>

<style scoped>
.speech-to-text-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
}

.speech-to-text-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
