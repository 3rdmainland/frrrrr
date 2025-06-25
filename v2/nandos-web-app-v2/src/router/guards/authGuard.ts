import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore.ts'

const authGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const authStore = useAuthStore()

  // Always fetch the latest user data to ensure we have the current authentication state
  await authStore.fetchUser()

  if (!authStore.isAuthenticated) {
    return next({ name: 'SignIn', query: { redirect: to.fullPath } })
  }

  next()
}

export default authGuard
