import Menu from '@/views/menu/menu.vue'
// import ProductDetail from '@/views/product/product-detail.vue'
import FavouritesMenu from '@/views/menu/filtered/favourites-menu.vue'
import PromosMenu from '@/views/menu/filtered/promos-menu.vue'
import RandomMenu from '@/views/menu/filtered/random-menu.vue'
import CombosMenu from '@/views/menu/filtered/combos-menu.vue'
import ProductDetail from '@/views/product-detail/ProductDetail.vue'

const menuRoutes = [
  {
    path: '/menu',
    name: 'Menu',
    component: Menu,
  },
  {
    path: '/menu/favorites',
    name: 'FavoritesMenu',
    component: FavouritesMenu,
  },
  {
    path: '/menu/promos',
    name: 'PromosMenu',
    component: PromosMenu,
  },
  {
    path: '/menu/discover',
    name: 'RandomMenu',
    component: RandomMenu,
  },
  {
    path: '/menu/combos',
    name: 'CombosMenu',
    component: CombosMenu,
  },
  {
    path: '/menu/product/:productId',
    name: 'ProductDetail',
    component: ProductDetail,
  },
]

export default menuRoutes
