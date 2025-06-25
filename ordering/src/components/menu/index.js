export { default as Menu } from './menu.vue'
export { default as MenuChangeAddressPrompt } from './menu-change-address-prompt/menu-change-address-prompt.vue'
export { default as MenuJumpLinks } from './menu-jump-links/menu-jump-links.vue'
export { default as MenuQuickLinks } from './menu-quick-links/menu-quick-links.vue'
export { default as Product } from './product/product.vue'
export { default as ProductConfigurator } from './product/product-configurator/product-configurator.vue'
export { default as ProductConfiguratorFlavourSelection } from './product/product-configurator-flavour-selection/product-configurator-flavour-selection.vue'
export { default as ProductNutritionalInfo } from './product/product-nutritional-info/product-nutritional-info.vue'
export { default as ProductUpseller } from './product/product-upseller/product-upseller.vue'
export * from './menu-tile'

export const PeriOmeter = require(`./peri-ometer/${process.env.VUE_APP_REGION}/peri-ometer`).default