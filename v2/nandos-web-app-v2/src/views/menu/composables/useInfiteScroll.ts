// composables/useMenuInfiniteScroll.ts
import { ref, onMounted, onUnmounted } from 'vue'

export const useMenuInfiniteScroll = (
  loadMore: () => void,
  options = { rootMargin: '200px' }
) => {
  const observer = ref<IntersectionObserver | null>(null)
  const trigger = ref<HTMLElement | null>(null)

  const setupObserver = () => {
    if (!trigger.value) return

    observer.value = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      options
    )

    observer.value.observe(trigger.value)
  }

  const cleanup = () => {
    if (observer.value) {
      observer.value.disconnect()
      observer.value = null
    }
  }

  onMounted(() => {
    setupObserver()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    trigger,
    observer
  }
}
