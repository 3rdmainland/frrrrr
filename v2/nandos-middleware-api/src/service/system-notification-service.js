import ApiHttp from '../http';
import SystemNotification from '../model/system-notification';
import Cache from './i18n-cache-service'
import MenuCategory, { CATEGORY_DISPLAY_TYPES } from '../model/menu-category'
import MenuDisplayItem from '../model/menu-display-item'

class SystemNotificationService {

  get cacheKey() {
    return 'system-notifications'
  }

  get endpoint() {
    return '/v2/pack/system-notification'
  }

  getNotifications() {
    return Cache.get(this.cacheKey) ||
      Cache.put(this.cacheKey, ApiHttp.get(this.endpoint)
        .then(result => result.data.systemNotifications.map(notification => new SystemNotification(notification)))
        .catch(error => Cache.clear(this.cacheKey)))
  }

  getSystemBannerNotifications(){
    return this.getNotifications().then(notifications => notifications.filter(n=>n.type.endsWith('BANNER')).sort((a, b) => a.displayOrder - b.displayOrder))
  }

  getSystemNotificationCategory() {
    return this.getNotifications()
      .then(notifications => notifications.filter(n => !n.type.endsWith('BANNER') ).sort((a, b) => a.displayOrder - b.displayOrder))
      .then(this._createCategoryDisplayItemFromPromotions)
  }

  _createCategoryDisplayItemFromPromotions(notifications) {
    let category = MenuCategory.quickBuild(notifications)
    category.displayType = CATEGORY_DISPLAY_TYPES.CAROUSEL
    return new MenuDisplayItem(category)
  }
}

export default new SystemNotificationService()