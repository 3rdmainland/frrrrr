import { computed } from 'vue'

export function useMediaQueriesMeta() {
  return {
    prefersReducedMotion: computed(
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    ),
  }
}
