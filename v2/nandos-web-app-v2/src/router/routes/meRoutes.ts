import authGuard from '@/router/guards/authGuard.ts';
import { type RouteRecordRaw } from 'vue-router'

const Me = () => import('@/views/me/me.vue');
const OrderHistory = () => import('@/views/me/order-history/order-history.vue');
const Addresses = () => import('@/views/me/addresses/addresses.vue');
const GiftCardWallet = () => import('@/views/me/gift-card-wallet/gift-card-wallet.vue');
const Settings = () => import('@/views/me/settings/settings.vue');
const CreditCards = () => import('@/views/me/credit-cards/credit-cards.vue');
const DetailsPreferences = () => import("@/views/me/details-preferences/details-preferences.vue");
const VerifyPhoneChange = () => import("@/views/me/settings/verify-phone-change/verify-phone-change.vue");

const meRoutes: RouteRecordRaw[] = [
  {
    path: '/me',
    name: 'Me',
    component: Me,
    beforeEnter: authGuard,
    children: [
      {
        path: 'order-history',
        name: 'Order History',
        component: OrderHistory,
        children: [
          {
            path: ':id',
            name: 'Order Details',
            component: OrderHistory,
          },
          {
            path: ':id/edit',
            name: 'Edit Order',
            component: OrderHistory,
          },
        ],
      },
      {
        path: 'details-preferences',
        name: 'Details Preferences',
        component: DetailsPreferences,
      },
      {
        path: 'addresses',
        name: 'Addresses',
        component: Addresses,
      },
      {
        path: 'gift-cards',
        name: 'Gift Cards',
        component: GiftCardWallet,
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
      },
      {
        path: 'settings/verify-change-phone',
        name: 'VerifyPhoneChange',
        component: VerifyPhoneChange,
      },
      {
        path: 'credit-cards',
        name: 'CreditCards',
        component: CreditCards,
      },
    ],
  },
]

export default meRoutes
