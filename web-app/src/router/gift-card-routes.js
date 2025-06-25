import { authGuard, navigateOneStepUp } from './index'
import { ViewStateService } from 'nandos-core-ui'
import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import { GenericContentPage } from '@/components/general'

export default function(router) {
  const GiftCardBasketService = require('nandos-middleware-api/service/gift-card-basket-service').default

  const giftCardPaymentGuard = (to, from, next, nextIfValidationPasses = true) => {
    return authGuard(to, from, next, false)
      .then(passed => {
        if(passed) {
          return Promise.all([CustomerService.isVerified(), CustomerService.getMe(), GiftCardBasketService.getBasket()])
            .then(([isVerified, me, giftCardBasket]) => {
              if(!isVerified) {
                let path = '/sign-up/verify'
                ViewStateService.setInitialisationData(path, {mobilePhoneNumber: me.mobilePhoneNumber})
                next({path: path, query: { redirect: to.fullPath }});
                return false;
              }
              else if(giftCardBasket.isEmpty || giftCardBasket.exceedsMaximumOrderValue) {
                next({path: '/gift-cards/basket'});
                return false;
              }
              else {
                if(nextIfValidationPasses) next();
                return true;
              }
            })
        }
      });
  }

  const Wallet = require('@/components/me/wallet/wallet.vue').default
  const GiftCardOrderDetial = require('@/components/me/order-history/gift-card-order-detail/gift-card-order-detail.vue').default

  router.addRoutes([
    { path: '/me/wallet', component: Wallet, beforeEnter: authGuard },
    { path: '/me/history/gift-card', redirect: navigateOneStepUp }, // If there is no ID after "gift-card", redirect to "/me/history"
    { path: '/me/history/gift-card/:order_id', component: GiftCardOrderDetial, props:true, beforeEnter: authGuard },
  ])

  const GiftCardComponents = require('@/components/gift-cards')
  router.addRoutes([
    { path: '/gift-cards', component: GiftCardComponents.GiftCardLanding },
    { path: '/gift-cards/basket', component: GiftCardComponents.GiftCardBasket, name: 'gift-card-basket' },
    { path: '/gift-cards/basket/checkout', component: GiftCardComponents.GiftCardCheckout, beforeEnter: giftCardPaymentGuard },
    { path: '/gift-cards/basket/checkout/success/:orderId', component: GiftCardComponents.GiftCardBasketCheckoutSuccess, beforeEnter: authGuard, props: true },
    { path: '/gift-cards/basket/:cardId', redirect: navigateOneStepUp },
    {
      path: '/gift-cards/basket/:cardId',
      component: GiftCardComponents.GiftCardCreator,
      props: true,
      meta: {
        computeRouteKey(route) {
          return 'gift-cards-create'
        }
      },
      children: [
        { path: 'design', component: GiftCardComponents.CardDesign },
        { path: 'design/amount', component: GiftCardComponents.CardAmount },
        { path: 'design/amount/message', component: GiftCardComponents.CardMessage },
        { path: 'design/amount/message/recipients', component: GiftCardComponents.CardRecipients },
        { path: 'design/amount/message/recipients/details', component: GiftCardComponents.CardDeliveryDetails },
      ]
    },
    { path: '/gift-cards/terms-and-conditions', component: GenericContentPage, props: {snippetId: 'gift-card-terms-and-conditions' }},
  ])
}