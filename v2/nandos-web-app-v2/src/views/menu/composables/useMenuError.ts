// composables/useMenuError.ts
import { ref } from 'vue'

export const useMenuError = () => {
  const errors = ref<Map<string, Error>>(new Map())

  const setError = (key: string, error: Error) => {
    errors.value.set(key, error)
  }

  const clearError = (key: string) => {
    errors.value.delete(key)
  }

  const clearAllErrors = () => {
    errors.value.clear()
  }

  const hasError = (key: string) => {
    return errors.value.has(key)
  }

  const getError = (key: string) => {
    return errors.value.get(key)
  }

  const retry = async (key: string, fn: () => Promise<void>) => {
    clearError(key)
    try {
      await fn()
    } catch (err) {
      setError(key, err as Error)
    }
  }

  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    hasError,
    getError,
    retry
  }
}
