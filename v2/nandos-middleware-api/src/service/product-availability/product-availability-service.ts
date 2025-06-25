// product-availability-service.ts
import Observable from '../../util/observable'
import filterToQuery from '../../util/filter-to-query'
import ApiHttp from '../../http'
import Menu from '../../model/menu'
import Basket from '../../model/basket'
import EXCLUSION_TYPES from '../../model/product-exclusion-types'

export const AVAILABILITY_CHANGED = 'AVAILABILITY_CHANGED'

// Add proper typing for the menu service
interface MenuServiceInterface {
  getProductMap(): Promise<Record<string, any>>
}

export default class ProductAvailabilityService extends Observable {

  // Properly declare the menuService property with type
  public menuService: MenuServiceInterface | null = null
  private _basketService: any = null
  private _cache: Record<string, any> = {}

  constructor() {
    super()

    this._cache = {}

    // To avoid circular dependencies between the AvailabilityService and the Basket/Menu Service, basket and menu service instances need to be passed in this service
    this.menuService = null
    this._basketService = null
  }

  get basketService() {
    return this._basketService
  }

  set basketService(newService) {
    // clean up listener's on old service
    this._basketService && this._basketService.removeObserver(this, 'ORDER_SETUP_CHANGED')

    this._basketService = newService

    this._basketService.addObserver(this, 'ORDER_SETUP_CHANGED', () => {
      this._cache = {}
      this.notifyObservers(AVAILABILITY_CHANGED)
    })
  }

  _getBasketId() {
    return this.basketService.getBasketSummary()
      .then((basket: any) => basket.id)
  }

  _getExclusions() {
    return this.basketService.getBasketSummary()
      .then(({id}: {id: string}) => this._cache[id] || (this._cache[id] = ApiHttp.get(`/v2/pack/product-exclusion?${filterToQuery({basketId: id})}`)))
      .then((result: any) => result.data.productExclusions)
      .catch((e: any) => {
        // Note: using 'any' here since we don't have access to the basket id in this scope
        Object.keys(this._cache).forEach(key => this._cache[key] = null)
        // logger.error('Nandos Middleware', 'ProductAvailabilityService::', e)
        return {} // return empty exclusion dict
      })
  }

  applyTo(entity: Menu | Basket) {
    return this._getExclusions()
      .then((rules: any) => {
        if(entity instanceof Menu) {
          Object.values(entity.productDefinitionsMap)
            .forEach((definition: any) => definition.exclusions = this._findExclusions(rules, definition.id))
        }
        else if(entity instanceof Basket) {

          /**
           * Get corresponding product for each basket item, and then use that product's availability
           * to deduce the basket item's availability
           */
          if (!this.menuService) {
            console.warn('MenuService not available, skipping availability check for basket items')
            return Promise.resolve()
          }

          return this.menuService.getProductMap()
            .then((productMap: Record<string, any>) => {

              const setAvailability = (basketItem: any, product: any) => {
                let productExists = product != null
                basketItem.available = productExists && product.isAvailable()
                basketItem.exclusions = productExists ? product.getExclusions() : [EXCLUSION_TYPES.OUT_OF_STOCK]
                if(basketItem.subItems && productExists) {
                  basketItem.subItems.forEach((subItem: any) => setAvailability(subItem, product.getRelatedProduct(subItem.productId)))
                }
              }

              entity.items.forEach((basketItem: any) => setAvailability(basketItem, productMap[basketItem.productId]))
            })
        }
      })
      .then(() => entity) // as a convention we always return the original entity passed in
  }

  _findExclusions(rules: any, definitionId: string) {
    return Object.entries(rules || {})
      .filter(([type, exclusions]: [string, any]) => exclusions.includes(definitionId))
      .map(([type, exclusions]: [string, any]) => type)
  }

  /**
   * Will drop the memcache and let other services know availability might have changed.
   * Other services that listen out for `AVAILABILITY_CHANGED` can then re-request availability data, which will be retrieved fresh via a network request
   */
  forceRecheck() {
    this._cache = {}
    this.notifyObservers(AVAILABILITY_CHANGED)
  }
}