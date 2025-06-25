import Vue from 'vue'
import Router from 'vue-router'
import { ViewStateService } from 'nandos-core-ui'

import GlobalConfigService from 'nandos-middleware-api/service/global-config-service'
import Http from 'nandos-middleware-api/http'
import Tracker from 'nandos-tracking'
import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import MenuService from 'nandos-middleware-api/service/menu/my-menu-service'
import BasketService from 'nandos-middleware-api/service/basket/my-basket-service'
import PublicOrderTrackingService from 'nandos-middleware-api/service/public-order-tracking-service'

import { SignUp, SignUpVerify, SignIn, PasswordReset, PasswordResetVerify } from '@/components/authentication'
import { Overview, Info, AddressListing, AddressDetail, AccountSettings, ChangePhoneVerify, MySavedCreditCards, AddCreditCard, OrderHistoryListing, FoodOrderDetial } from '@/components/me'
import { Contact } from '@/components/contact'
import { About } from '@/components/about'
import { StoreListing } from '@/components/stores'
import { HelpListing, HelpDetail } from '@/components/help'
import Checkout from '@/components/checkout/checkout.vue'

import { Offline, UpgradeNotice, GenericContentPage, EmbeddedContentPage } from '@/components/general'
import { AppPromotionLanding } from '@/components/app-promotion-landing'

import {  Menu, MenuItemListing, Product, ProductConfigurator, ProductNutritionalInfo, Basket, CheckoutInstructions, OrderSetup, OrderSetupType, OrderSetupAddress, OrderSetupAddressDetails, OrderSetupStore, OrderSetupEatInLanding, OrderSetupEatInDetails }
  from '@/components/ordering'

const CAN_GUEST_CHECKOUT = true

/**
 * Replicate vue-router-next behavior
 * Catch navigation "failures", like navigation duplicated and navigation redirected.
 * These "errors" are still returned as usual, and can be caught using router.push().catch(e...)
 * They just don't clutter up the console
 * https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378
 */
const originalPush = Router.prototype.push
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch((error) => {
    if (Router.isNavigationFailure(error)) {
      return error // resolve with error (for any push calls that catch errors)
    }
    // Re-throw error
    return Promise.reject(error)
  })
}

const originalReplace = Router.prototype.replace
Router.prototype.replace = function replace(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalReplace.call(this, location, onResolve, onReject)
  return originalReplace.call(this, location).catch((error) => {
    if (Router.isNavigationFailure(error)) {
      return error // resolve with error (for any replace calls that catch errors)
    }
    // Re-throw error
    return Promise.reject(error)
  })
}

Vue.use(Router);

// Before any route is displayed, make sure we have global configs
// The only route that will be displayed without global configs is the offline page
const globalConfigGuard = (to, from, next, nextIfValidationPasses = true) => {
  if (to.matched.some(record => record.meta.skipGlobalConfigGuard)) {
    if(nextIfValidationPasses) next()
    return Promise.resolve(true)
  }
  else {
    return GlobalConfigService.getConfigs()
      .then(configs => {
        if(nextIfValidationPasses) next();
        return true;
      })
      .catch(e => {
        let reason
        try { reason = e.response.data.error.code }
        catch(x) {}
        if(reason == 'UNSUPPORTED_VERSION')
          next({path: '/upgrade', query: { redirect: to.fullPath }})
        else
          next({path: '/offline', query: { redirect: to.fullPath }})
        return false
      })
  }
}

export const authGuard = (to, from, next, nextIfValidationPasses = true) => {
  return CustomerService.isAnonymous()
    .then(isAnonymous => {
      if(isAnonymous) {
        next({name: 'sign-in', query: { redirect: to.fullPath }})
        return false;
      }
      else {
        if(nextIfValidationPasses) next();
        return true;
      }
    });
}

export const authedOrguestCheckoutGuard = (to, from, next, nextIfValidationPasses = true) => {
  return Promise.all([CustomerService.isAnonymous(), BasketService.getBasketSummary()])
    .then(([isAnonymous, basket]) => {
      if(isAnonymous && basket.allowGuestCheckout == false) {
        next({path: '/sign-in', query: { redirect: to.fullPath }})
        return false;
      }
      else {
        if(nextIfValidationPasses) next();
        return true;
      }
    });
}

const basketCheckoutGuard = (to, from, next, nextIfValidationPasses = true) => {
  return authedOrguestCheckoutGuard(to, from, next, false)
    .then(passed => {
      if(passed) {
        return Promise.all([CustomerService.isVerified(), CustomerService.getMe(), BasketService.getBasket()])
          .then(([isVerified, me, basket]) => {
            if(isVerified == false && basket.allowGuestCheckout == false) {
              let path = '/sign-up/verify'
              ViewStateService.setInitialisationData(path, {mobilePhoneNumber: me.mobilePhoneNumber})
              next({path: path, query: { redirect: to.fullPath }});
              return false;
            }
            if(basket.canCheckout == false) {
              if(!basket.isOrderSetup) {
                next({name: 'order-setup-start', query: { redirect: to.fullPath }})
              }
              else { // basket has some other issue, like it is empty, or contains unavailable products
                next({name: 'basket'});
              }
              return false
            }
            else {
              if(nextIfValidationPasses) next();
              return true;
            }
          })
      }
    });
}

let router = new Router({
  mode: process.env.VUE_APP_CONTEXT == 'WEB' ? 'history' : 'hash',
  base: process.env.VUE_APP_ROUTER_BASE_PATH,
  routes: [

    /**
     * Authentication
     */
    { path: '/sign-up', component: SignUp },
    { path: '/sign-up/verify', component: SignUpVerify },
    { path: '/sign-up/terms-and-conditions', component: GenericContentPage, props: {snippetId: 'terms-and-conditions' }},
    { path: '/sign-in', component: SignIn, name: 'sign-in' },
    { path: '/sign-in/password-reset', component: PasswordReset },
    { path: '/sign-in/password-reset/verify', component: PasswordResetVerify },
    { path: '/sign-in/terms-and-conditions', component: GenericContentPage, props: {snippetId: 'terms-and-conditions' }},
    
    /**
     * Me
     */
    { path: '/me', component: Overview, beforeEnter: authGuard },
    { path: '/me/info', component: Info, beforeEnter: authGuard },
    { path: '/me/addresses', component: AddressListing, beforeEnter: authGuard },
    { path: '/me/addresses/add', component: AddressDetail, beforeEnter: authGuard },
    { path: '/me/addresses/:address_id', component: AddressDetail, props: true, beforeEnter: authGuard },
    { path: '/me/settings/', component: AccountSettings, beforeEnter: authGuard },
    { path: '/me/settings/verify-change-phone', component: ChangePhoneVerify, beforeEnter: authGuard },
    { path: '/me/credit-cards', component: MySavedCreditCards, beforeEnter: authGuard },
    { path: '/me/credit-cards/add', component: AddCreditCard, beforeEnter: authGuard },

    // Food purchase history
    { path: '/me/history', component: OrderHistoryListing, beforeEnter: authGuard },
    { path: '/me/history/food', redirect: navigateOneStepUp }, // If there is no ID after "food", redirect to "/me/history"
    { path: '/me/history/food/:orderId', component: FoodOrderDetial, props: true, beforeEnter: authGuard },

    /**
     * Guest checkout order detail
     */
    { path: '/guest/order/food/:orderId', component: FoodOrderDetial, props: true },
    
    /**
     * Menu/Ordering
     */

    // TODO:: remove @v16
    // Promos need to be able to point to a product in a way that is cross-menu compatible
    // Product ID's are unique to each menu, so use the product's OHEICS ID to do the lookup, and then redirect to the
    // product detail route
    {
      path: '/menu/promotion/:oheicsId',
      beforeEnter: (to, from, next) => {
        return MenuService.getProductDefinitionIdFromOheicsId(to.params.oheicsId)
          .then(definitionId => {
            if(definitionId != null)
              next({
                name:'product-detail',
                params: Object.assign({}, from.params, { productDefinitionId: definitionId }),
                query: to.query
              })
            else
              next({name:'menu'})
          })
      }
    },

    {
      path: '/menu/:path(.*)?/configure',
      redirect: navigateOneStepUp, // If there is no productDefinitionId after "/configure", redirect to "/menu/:path(.*)
    },
    {
      path:'/menu/:path(.*)?/configure/:productDefinitionId/nutrition',
      component: ProductNutritionalInfo,
      props: true,
    },
    {
      path: '/menu/:path(.*)?/configure/:productDefinitionId',
      component: Product,
      props: true,
      meta: {
        computeRouteKey(route) {
          return `product/${route.params.productDefinitionId}`
        }
      },
      children: [
        {
          component: ProductConfigurator,
          path: ':configs(.*)?',
          name: 'product-detail',
          props: (route) => {
            let lastConfigId = route.params.configs
              ? route.params.configs.split('/')
                  .filter(part => part !== '')
                  .pop()
              : null;

            return {
              ...route.params,
              relatedProductId: lastConfigId,
            }
          }
        }
      ]
    },

    {
      path: '/menu',
      component: Menu,
      props: true,
      meta: {
        computeRouteKey(route) {
          return `menu/`
        }
      },
      children: [
        {
          path: 'search',
          component: MenuItemListing,
          props: route => Object.assign({isSearch: true}, route.params),
          name: 'menu-search',
        },
        {
          path: 'suggested-for-you',
          beforeEnter: authGuard,
          component: MenuItemListing,
          props: route => Object.assign({isSuggested: true}, route.params),
          name: 'menu-suggestions',
        },
        {
          path: ':path(.*)?',
          component: MenuItemListing,
          props: true,
          name: 'menu',
        },
      ],
    },


    // Eat in/ At Table QR Code handler (as well as manual short code input)
    {
      path: '/table-scan/:shortCode',
      name: 'table-scan',
      beforeEnter: (to, from, next) => {
        next({name: 'order-setup-eat-in-details', query: Object.assign({}, to.query, {shortCode: to.params.shortCode})})
      }
    },

    {
      path: '/setup',
      component: OrderSetup,
      meta: {
        computeRouteKey(route) {
          return '/setup'
        }
      },
      children: [
        { path: '', name: 'order-setup-start', component: OrderSetupType, }, // use '/setup' as path to get rid of weird trailing slash bug in vue router
        { path: 'address', name: 'order-setup-address', component: OrderSetupAddress, },
        { path: 'address/address-detail', name: 'order-setup-address-details', component: OrderSetupAddressDetails, },
        { path: 'address/store', name: 'order-setup-final', component: OrderSetupStore, },

        { path: 'eat-in', name: 'order-setup-eat-in-landing', component: OrderSetupEatInLanding },
        {
          path: 'eat-in/details',
          name: 'order-setup-eat-in-details',
          component: OrderSetupEatInDetails,
          props: route => {
            let {shortCode} = route.query
            return Object.assign({shortCode}, route.params)
          },
        },
      ]
    },

    { path: '/basket', name: 'basket', component: Basket },
    { path: '/basket/options', name: 'basket-instructions', component: CheckoutInstructions, beforeEnter: authedOrguestCheckoutGuard },
    { path: '/basket/options/checkout', name: 'basket-checkout', component: Checkout, beforeEnter: basketCheckoutGuard },

    { path: '/contact', component: Contact },
    { path: '/about', component: About },
    { path: '/stores', component: StoreListing },
    { path: '/content/:snippetId', component: GenericContentPage, props: true },
    { path: '/embedded-content/:snippetId', component: EmbeddedContentPage, props: true },

    { path: '/app-promos', component: AppPromotionLanding },

    {
      path: '/(.*)?/:context(food|gift-card)/:relatedEntity/help',
      component: HelpListing,
      beforeEnter: authGuard,
      props: true,
    },
    {
      path: '/(.*)?/:context(food|gift-card)/:relatedEntity/help/:helpItemId',
      component: HelpDetail,
      beforeEnter: authGuard,
      props: true,
    },

    // Allows non-registered users to see the food order detail view and track their order's fulfilment status
    {
      path: '/order-tracking/:publicTrackingToken',
      component: FoodOrderDetial,
      props: true,
      /*beforeEnter: (to, from, next) => {
        return CustomerService.isAnonymous()
          .then(isAnonymous => {
            if(isAnonymous) {
              next()
            }
            else { // if this is a registered user, show them the "normal" food detail view
              PublicOrderTrackingService.getOrder(to.params.publicTrackingToken)
                .then(order => next(`/me/history/food/${order.id}`))
            }
          });
      }*/
    },

    { path: '/upgrade', component: UpgradeNotice, meta: { skipGlobalConfigGuard: true } },
    { path: '/offline', component: Offline, meta: { skipGlobalConfigGuard: true } },

    { path: '*', redirect: { name: 'menu'} },
  ]
})

if(process.env.NODE_ENV == 'development') {
  router.addRoutes([{ path: '/test', component: () => import('@/components/test.vue') }])
  router.addRoutes([{ path: '/test/123', component: () => import('@/components/test.vue') }])
}

if(process.env.VUE_APP_REGION_SUPPORTS_GIFT_CARDS == 'true') {
  const gcRoutes = require('./gift-card-routes').default
  gcRoutes(router)
}


router.beforeEach(globalConfigGuard)

router.afterEach((to, from) => {
  let path = router.options.base + to.fullPath
  if(to.query.query)
    Tracker.track('search', path, to.query)
  else
    Tracker.track('pageView', path)
})

export function navigateOneStepUp(route) {
  return route.path.split('/').slice(0, -1).join('/')
}

Http.addObserver(router, 'CONNECTION_STATUS_OFFLINE', () => {
  if(router.currentRoute.path == '/offline') return
  router.push({path: '/offline', query: {redirect: router.currentRoute.fullPath}})
})

Http.addObserver(router, 'UNSUPPORTED_VERSION', () => {
  if(router.currentRoute.path == '/upgrade') return
  router.push({path: '/upgrade', query: {redirect: router.currentRoute.fullPath}})
})

export default router