// new/eat-in/eat-in-landing.vue
<template>
  <div class="min-h-screen bg-[#111111] flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Back Button -->
      <NButton @click="goBack" variant="unstyled" class="mb-4 text-white hover:text-red-400">
        <NIcon icon="arrow-left" size="md" class="mr-2" />
        Back
      </NButton>

      <!-- Header -->
      <h1 class="text-2xl md:text-3xl font-bold text-white text-center mb-8">
        Order from your table
      </h1>

      <!-- QR Scanner Card -->
      <div
        v-if="hasCamera"
        @click="showScanner = true"
        class="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 mb-6"
      >
        <div class="text-center text-white">
          <NIcon icon="qr-code" size="4xl" class="mb-4" />
          <h2 class="text-xl font-bold mb-2">Scan QR Code</h2>
          <p class="text-sm opacity-90">Scan the QR code on your table</p>
        </div>
      </div>

      <!-- No Camera Message -->
      <NAlert
        v-else
        variant="warning"
        title="Camera not available"
        subtext="Use the table code option below to continue"
        class="mb-6"
      />

      <!-- Divider -->
      <div class="relative my-8">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-700"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-[#111111] text-gray-400">or</span>
        </div>
      </div>

      <!-- Table Code Form -->
      <div class="bg-gray-900 rounded-2xl p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Enter table code</h3>
        <form @submit.prevent="onTableCodeSubmit">
          <NInput
            v-model="tableCode"
            placeholder="e.g. A1, B12"
            :error="tableCodeError"
            class="mb-4"
            autofocus
            @input="tableCodeError = ''"
          />
          <NButton
            type="submit"
            variant="secondary"
            size="lg"
            class="w-full"
            :disabled="!tableCode.trim()"
          >
            Continue
          </NButton>
        </form>
        <p class="text-xs text-gray-400 mt-3">
          The table code is displayed on your table
        </p>
      </div>
    </div>

    <!-- QR Scanner Modal -->
    <NModal v-model="showScanner" fullscreen>
      <div class="h-full bg-black relative">
        <QRScanner
          v-if="showScanner"
          @result="onScanResult"
          @error="onScanError"
        />
        <NButton
          @click="showScanner = false"
          variant="unstyled"
          class="absolute top-4 right-4 text-white hover:text-red-400"
        >
          <NIcon icon="close" size="xl" />
        </NButton>
      </div>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NInput, NIcon, NAlert, NModal } from 'nandos-core-ui-v2'
import QRScanner from '@/components/qr-scanner.vue'
import { useOrderSetupStore } from '@/stores/orderSetupStore'

const router = useRouter()
const orderSetup = useOrderSetupStore()

// State
const hasCamera = ref(false)
const showScanner = ref(false)
const tableCode = ref('')
const tableCodeError = ref('')

// Check camera availability
const checkCamera = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    hasCamera.value = devices.some(device => device.kind === 'videoinput')
  } catch {
    hasCamera.value = false
  }
}

// Navigation
const goBack = () => {
  router.push('/setup')
}

// Table code submission
const onTableCodeSubmit = () => {
  if (!tableCode.value.trim()) {
    tableCodeError.value = 'Please enter a table code'
    return
  }

  router.push({
    name: 'eat-in-confirm',
    params: { shortCode: tableCode.value.trim() }
  })
}

// QR scan handlers
const onScanResult = (result: string) => {
  showScanner.value = false

  try {
    const url = new URL(result)

    // Extract table code from URL
    // Expected format: https://nandos.com/table/ABC123
    const match = url.pathname.match(/\/table\/([A-Z0-9]+)/i)

    if (match && match[1]) {
      router.push({
        name: 'eat-in-confirm',
        params: { shortCode: match[1] }
      })
    } else {
      throw new Error('Invalid QR code format')
    }
  } catch (error) {
    console.error('QR scan error:', error)
    showScanner.value = false
    tableCodeError.value = 'Invalid QR code. Please try again or enter the code manually.'
  }
}

const onScanError = (error: any) => {
  console.error('Scanner error:', error)
  showScanner.value = false
  tableCodeError.value = 'Failed to scan QR code. Please enter the code manually.'
}

// Lifecycle
onMounted(() => {
  checkCamera()
})
</script>

// ===================================
// new/eat-in/eat-in-confirm.vue
// ===================================

<template>
  <div class="min-h-screen bg-[#111111] flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Back Button -->
      <NButton @click="goBack" variant="unstyled" class="mb-4 text-white hover:text-red-400">
        <NIcon icon="arrow-left" size="md" class="mr-2" />
        Back
      </NButton>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <NIcon icon="spinner" size="3xl" class="animate-spin text-red-400 mb-4" />
        <p class="text-white">Verifying table code...</p>
      </div>

      <!-- Error State -->
      <NAlert
        v-else-if="error"
        variant="error"
        title="Invalid table code"
        :subtext="errorMessage"
        class="mb-6"
      >
        <template #actions>
          <NButton @click="tryAnother" variant="secondary" size="sm" class="mt-3">
            Try another code
          </NButton>
        </template>
      </NAlert>

      <!-- Success State -->
      <div v-else-if="tableData" class="text-center">
        <h1 class="text-2xl md:text-3xl font-bold text-white mb-8">
          Confirm your table
        </h1>

        <div class="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-8 mb-8">
          <NIcon icon="table" size="3xl" class="text-white mb-4" />
          <div class="text-white">
            <p class="text-sm opacity-90 mb-2">Table</p>
            <p class="text-6xl font-bold mb-4">{{ tableId }}</p>
            <p class="text-lg">{{ store?.displayName || store?.name }}</p>
          </div>
        </div>

        <!-- Sign In Prompt (if not signed in) -->
        <div v-if="!isSignedIn" class="bg-gray-900 rounded-lg p-4 mb-6">
          <p class="text-gray-300 mb-3">Sign in to save your favorites and earn rewards</p>
          <NButton
            @click="goToSignIn"
            variant="secondary"
            size="sm"
            class="w-full"
          >
            Sign In
          </NButton>
        </div>

        <!-- Confirm Button -->
        <NButton
          @click="confirmTable"
          variant="primary"
          size="lg"
          class="w-full"
          :loading="confirming"
        >
          Start Ordering
        </NButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NButton, NIcon, NAlert } from 'nandos-core-ui-v2'
import { useOrderSetupStore } from '@/stores/orderSetupStore'
import StoreService from 'nandos-middleware-api/src/service/store-service'
import BasketService from 'nandos-middleware-api/src/service/basket/my-basket-service'
import CustomerService from 'nandos-middleware-api/src/service/customer/me-service'

const router = useRouter()
const route = useRoute()
const orderSetup = useOrderSetupStore()

// Props from route
const shortCode = ref(route.params.shortCode as string)

// State
const loading = ref(true)
const confirming = ref(false)
const error = ref(false)
const errorMessage = ref('')
const tableData = ref<any>(null)
const store = ref<any>(null)
const tableId = ref('')
const isSignedIn = ref(false)

// Navigation
const goBack = () => {
  router.push('/setup/eat-in')
}

const tryAnother = () => {
  router.push('/setup/eat-in')
}

const goToSignIn = () => {
  router.push({
    name: 'sign-in',
    query: { redirect: route.fullPath }
  })
}

// Resolve table code
const resolveTableCode = async () => {
  loading.value = true
  error.value = false

  try {
    const result = await StoreService.resolveStoreShortCode(shortCode.value)

    store.value = result.store
    tableId.value = result.tableId
    tableData.value = result

    // Check store availability
    if (!store.value.eatInCapable || !store.value.menuId) {
      throw new Error('This store is not accepting eat-in orders')
    }

  } catch (err: any) {
    console.error('Failed to resolve table code:', err)
    error.value = true
    errorMessage.value = err.message || 'The code you entered is not valid. Please check and try again.'
  } finally {
    loading.value = false
  }
}

// Check if user is signed in
const checkAuth = async () => {
  try {
    const customer = await CustomerService.getMe()
    isSignedIn.value = !customer.anonymous
  } catch {
    isSignedIn.value = false
  }
}

// Confirm and proceed
const confirmTable = async () => {
  if (!store.value || !tableId.value) return

  confirming.value = true

  try {
    // Configure eat-in order
    await BasketService.configureEatInOrder(store.value.id, tableId.value)

    // Update order setup store
    orderSetup.setOrderType('EAT_IN')
    orderSetup.setStore(store.value)
    orderSetup.setEatInTable(tableId.value)

    // Navigate to menu
    router.push('/menu')

  } catch (err: any) {
    console.error('Failed to configure order:', err)
    error.value = true
    errorMessage.value = 'Failed to set up your order. Please try again.'
  } finally {
    confirming.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (!shortCode.value) {
    router.push('/setup/eat-in')
    return
  }

  Promise.all([
    resolveTableCode(),
    checkAuth()
  ])
})
</script>

// This is saved as multiple files:
// - new/eat-in/eat-in-landing.vue
// - new/eat-in/eat-in-confirm.vue
// - new/components/qr-scanner.vue

<template>
  <div class="qr-scanner">
    <video ref="video" class="w-full h-full object-cover"></video>
    <div class="scanner-overlay">
      <div class="scanner-frame"></div>
      <p class="instruction-text">Position QR code within the frame</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import QrScanner from 'qr-scanner'

// Emits
const emit = defineEmits<{
  result: [data: string]
  error: [error: Error]
}>()

// Refs
const video = ref<HTMLVideoElement>()
let scanner: QrScanner | null = null

// Start scanning
const startScanning = async () => {
  if (!video.value) return

  try {
    scanner = new QrScanner(
      video.value,
      (result) => {
        emit('result', result.data)
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    )

    await scanner.start()
  } catch (error: any) {
    console.error('Scanner error:', error)
    emit('error', error)
  }
}

// Stop scanning
const stopScanning = () => {
  if (scanner) {
    scanner.stop()
    scanner.destroy()
    scanner = null
  }
}

// Lifecycle
onMounted(() => {
  startScanning()
})

onUnmounted(() => {
  stopScanning()
})
</script>

<style scoped>
.qr-scanner {
  position: relative;
  width: 100%;
  height: 100%;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scanner-frame {
  width: 250px;
  height: 250px;
  border: 3px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  position: relative;
}

.scanner-frame::before,
.scanner-frame::after {
  content: '';
  position: absolute;
  width: 40px;
  height: 40px;
  border: 4px solid #ef4444;
}

.scanner-frame::before {
  top: -4px;
  left: -4px;
  border-right: none;
  border-bottom: none;
  border-radius: 12px 0 0 0;
}

.scanner-frame::after {
  bottom: -4px;
  right: -4px;
  border-left: none;
  border-top: none;
  border-radius: 0 0 12px 0;
}

.instruction-text {
  color: white;
  margin-top: 20px;
  font-size: 14px;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 16px;
  border-radius: 20px;
}
</style>
