import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import GlobalConfigService from 'nandos-middleware-api/src/service/global-config-service.ts'
import type { IPlatformConfiguration } from 'nandos-types'

export const useGlobalConfigStore = defineStore('globalConfig', () => {
  const config = ref<IPlatformConfiguration | null>()
  const error = ref<any | null>(null)
  const flavours = computed(() => config.value?.flavours)
  const defaultLocale = import.meta.env.VITE_DEFAULT_LOCALE

  const fetchGlobalConfig = async () => {
    try {
      config.value = await GlobalConfigService.getConfigs()
      return config.value
    } catch (err) {
      error.value = err
      config.value = null
      return null
    }
  }

  console.log({ defaultLocale })

  return {
    // State
    config,
    defaultLocale,
    // Getters
    flavours,
    // Actions
    fetchGlobalConfig,
  }
})
