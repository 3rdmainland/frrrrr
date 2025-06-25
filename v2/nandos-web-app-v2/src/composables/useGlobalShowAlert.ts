// src/composables/useGlobalAlert.ts
import { reactive, toRefs } from 'vue'

type AlertVariants = 'success' | 'info' | 'warning' | 'error' | 'custom'

interface AlertState {
  show: boolean
  variant: AlertVariants
  title: string
  subtext: string
  dismissable: boolean
}

const state = reactive<AlertState>({
  show: false,
  variant: 'info',
  title: '',
  subtext: '',
  dismissable: true,
})

export function useGlobalAlert() {
  return {
    ...toRefs(state),
    showAlert: (opts: Partial<Omit<AlertState, 'show'>>) => {
      if (opts.variant !== undefined) state.variant = opts.variant
      if (opts.title !== undefined) state.title = opts.title
      if (opts.subtext !== undefined) state.subtext = opts.subtext
      if (opts.dismissable !== undefined) state.dismissable = opts.dismissable
      state.show = true
    },
    closeAlert: () => {
      state.show = false
    },
  }
}
