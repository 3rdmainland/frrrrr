import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/home/home.vue'
import authRoutes from '@/router/routes/authRoutes.ts'
import meRoutes from '@/router/routes/meRoutes.ts'
import menuRoutes from '@/router/routes/menuRoutes.ts'
import miscRoutes from '@/router/routes/miscRoutes.ts'
import { useAuthStore } from '@/stores/useAuthStore.ts'
import { useGlobalConfigStore } from '@/stores/useGlobalConfig'
import checkoutRoutes from '@/router/routes/checkoutRoutes.ts'

const router = createRouter({
  history: createWebHistory('/eat/order'),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    ...authRoutes,
    ...meRoutes,
    ...menuRoutes,
    ...miscRoutes,
    ...checkoutRoutes,
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: Home,
    },
  ],
})

// Global navigation guard to ensure authentication & global config state is loaded before rendering any route
router.beforeEach(async (_to, _from, next) => {
  const authStore = useAuthStore()
  await authStore.fetchUser()
  const globalConfigStore = useGlobalConfigStore()
  await globalConfigStore.fetchGlobalConfig()
  next()
})

export default router
