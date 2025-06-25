export const menuServiceKey = 'MENU_SERVICE'
export const basketServiceKey = 'BASKET_SERVICE'
export const globalConfigServiceKey = 'GLOBAL_CONFIG_SERVICE'
export const languageServiceKey = 'LANGUAGE_SERVICE'
export const isPreviewKey = 'IS_PREVIEW'

/**
 * Utility function to allow a component to pass common services from it's props/data and act as a provider to child components
 * Usage in component:
 * export default {
 *   props: {
 *     menuService: { type: Object, required: true },
 *     ...
 *   },
 *   
 *   provide: provideCommonServices,
 * }
 */
export function provideCommonServices() {
  return {
    [menuServiceKey]: this.menuService,
    [basketServiceKey]: this.basketService,
    [globalConfigServiceKey]: this.globalConfigService,
    [languageServiceKey]: this.languageService,
    [isPreviewKey]: this.preview || false,
  }
}