import authGuard from '@/router/guards/authGuard.ts'
import Basket from '@/views/basket/basket.vue'

const checkoutRoutes = [
  {
    path: '/basket',
    name: 'Basket',
    component: Basket,
    beforeEnter: authGuard,
    meta: { title: 'Basket' },
  },
]

export default checkoutRoutes
