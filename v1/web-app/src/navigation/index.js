import Router from '@/router'
import NavigationService, { NavigationItem } from 'nandos-middleware-api/service/navigation-service'
import NandosI18n from 'nandos-i18n'

const webAppPath = process.env.VUE_APP_ROUTER_BASE_PATH

/**
 * Returns a promise that resolves to an array of navigation items relevant to the application's current context and
 * the user's logged in state.
 */
export function slideOutNavItems (user) {

  return NavigationService.getBrochureNav()
    .then(brochureItems => {

      let items = []

      if(process.env.VUE_APP_CONTEXT == 'WEB') {

        /* Root (brochure site) */
        items.push(
          new NavigationItem({ title: NandosI18n.t('nav.home'), path: `/`}),
        )

        items.push(
          new NavigationItem({ title: NandosI18n.t('nav.menu'), path: `${webAppPath}/menu`}),
        )

        if(!user.anonymous) {
          /* Profile */
          items.push(
            new NavigationItem({ title: NandosI18n.t('nav.profile'), path: `${webAppPath}/me` }),
          )
        }
        
        // Brochure Nav items
        items = items.concat(brochureItems)
        
        /* Contact Us (brochure site) */
        items.push(
          new NavigationItem({ title: NandosI18n.t('nav.contact'), path: `/contact-us` })
        )
      }
      else { // Cordova app
        
        /* Menu, Find a Store, Gift cards */
        items.push(
          new NavigationItem({ title: NandosI18n.t('nav.menu'), path: `${webAppPath}/menu`}),
          new NavigationItem({ title: NandosI18n.t('nav.stores'), path: `${webAppPath}/stores` }),
        )

        if(process.env.VUE_APP_REGION_SUPPORTS_GIFT_CARDS == 'true') {
          items.push(
            new NavigationItem({ title: NandosI18n.t('nav.giftCards'), path: `${webAppPath}/gift-cards` }),
          )
        }

        /* Profile */
        if(!user.anonymous) {
          items.push(
            new NavigationItem({ title: NandosI18n.t('nav.profile'), path: `${webAppPath}/me` }),
          )
        }

        /* Contact us, About */
        items.push(
          new NavigationItem({ title: NandosI18n.t('nav.contact'), path: `${webAppPath}/contact` }),
          new NavigationItem({ title: NandosI18n.t('nav.about'), path: `${webAppPath}/about` }),
        )
      }

      return items
    })
}

export function headerNavItems () {

  const i18n = NandosI18n.i18n

  return NavigationService.getBrochureNav()
    .then(brochureItems => {

      let items = []
      if(process.env.VUE_APP_CONTEXT == 'WEB') {
        /* Menu */
        items.push(
          new NavigationItem({ title: NandosI18n.t('nav.menu'), path: `${webAppPath}/menu` }), 
        )

        items = items.concat(brochureItems)
      }
      else { // Cordova app
        items.push(
          new NavigationItem({ title: NandosI18n.t('nav.menu'), path: `${webAppPath}/menu` }), 
          new NavigationItem({ title: NandosI18n.t('nav.stores'), path: `${webAppPath}/stores` }),
        )
      }

      return items
    })
}


export function toolbarActionItems() {
  return NavigationService.getToolbarActions()
}