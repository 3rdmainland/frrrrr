import ApiHttp from '../http'
import Cache from './i18n-cache-service'

class NavigationService {

  getNavigation() {
    // return Cache.get('navigation') ||
    //   Cache.put('navigation',

      return  ApiHttp.get(`/navigation`)
        .then(response => {
          let nav = response.data.navigation
          for(var prop in nav) {
            nav[prop] = nav[prop].map(item => new NavigationItem(item))
          }
          return nav
        })
  // )
  }

  getBrochureNav() {
    return this.getNavigation().then(navigation => navigation.brochure)
  }

  getToolbarActions() {
    return this.getNavigation().then(navigation => navigation.headerLinks)
  }

  getDownloadableMenus() {
    return this.getNavigation().then(navigation => navigation.downloadableMenus)
  }
}

export class NavigationItem {

  constructor(data) {
    this.title = data.title
    this.path = data.path
    this.isExternal = ! this.path.startsWith(import.meta.env.VUE_APP_ROUTER_BASE_PATH)
    this.children = data.children && data.children.map(child => new NavigationItem(child))
    this.color = data.color
    this.icon = data.icon

    if(!this.isExternal) this.internalPath = this.path.replace(import.meta.env.VUE_APP_ROUTER_BASE_PATH, '')
  }
}

export default new NavigationService()