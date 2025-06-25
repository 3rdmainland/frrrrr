import { ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'

export const useMenuNavigation = () => {
  const route = useRoute()
  const categoryRefs = ref<Record<string, HTMLElement>>({})
  const selectedCategory = ref<string | null>(null)
  const scrollContainer = ref<HTMLElement | null>(null)

  const setCategoryRef = (idPath: string, el: HTMLElement | null) => {
    if (el) {
      categoryRefs.value[idPath] = el
    } else {
      delete categoryRefs.value[idPath]
    }
  }

  const scrollToCategory = async (idPath: string, retries = 5) => {
    selectedCategory.value = idPath

    const tryScroll = async (attempt = 0): Promise<boolean> => {
      const element = categoryRefs.value[idPath]

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
        return true
      }

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 200))
        return tryScroll(attempt + 1)
      }

      return false
    }

    await nextTick()
    return tryScroll()
  }

  const scrollToTop = () => {
    const container = scrollContainer.value || window

    if ('scrollTo' in container) {
      container.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  return {
    categoryRefs,
    selectedCategory,
    scrollContainer,
    setCategoryRef,
    scrollToCategory,
    scrollToTop
  }
}
