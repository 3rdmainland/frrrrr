import ContainerFactory from 'nandos-core-ui/src/utils/container-factory'

import CustomerService from 'nandos-middleware-api/service/customer/me-service'
import MenuService from 'nandos-middleware-api/service/menu/my-menu-service'
import BasketService from 'nandos-middleware-api/service/basket/my-basket-service'
import LanguageService from 'nandos-middleware-api/service/my-language-service'
import StoreService from 'nandos-middleware-api/service/store-service'
import GlobalConfigService from 'nandos-middleware-api/service/global-config-service'

const injectableDependencies = {
	customerService: CustomerService,
	menuService: MenuService,
	basketService: BasketService,
	globalConfigService: GlobalConfigService,
	languageService: LanguageService,
	storeService: StoreService,
}

// Nandos Ordering package components
import NandosOrderingBasket from 'nandos-ordering/src/components/basket/basket.vue'
import NandosOrderingCheckoutInstructions from 'nandos-ordering/src/components/basket/checkout-instructions/checkout-instructions.vue'
import NandosOrderingMenu from 'nandos-ordering/src/components/menu/menu.vue'
import NandosOrderingMenuItemListing from 'nandos-ordering/src/components/menu/menu-item-listing.vue'
import NandosOrderingProduct from 'nandos-ordering/src/components/menu/product/product.vue'
import NandosOrderingProductConfigurator from 'nandos-ordering/src/components/menu/product/product-configurator/product-configurator.vue'
import NandosOrderingProductNutritionalInfo from 'nandos-ordering/src/components/menu/product/product-nutritional-info/product-nutritional-info.vue'

import NandosOrderingOrderSetup from 'nandos-ordering/src/components/order-setup/order-setup.vue'
import NandosOrderingOrderSetupType from 'nandos-ordering/src/components/order-setup/order-setup-type/order-setup-type.vue'
import NandosOrderingOrderSetupAddress from 'nandos-ordering/src/components/order-setup/order-setup-address/order-setup-address.vue'
import NandosOrderingOrderSetupAddressDetails from 'nandos-ordering/src/components/order-setup/order-setup-address-details/order-setup-address-details.vue'
import NandosOrderingOrderSetupStore from 'nandos-ordering/src/components/order-setup/order-setup-store/order-setup-store.vue'
import NandosOrderingOrderSetupEatInLanding from 'nandos-ordering/src/components/order-setup/order-setup-eat-in-landing/order-setup-eat-in-landing.vue'
import NandosOrderingOrderSetupEatInDetails from 'nandos-ordering/src/components/order-setup/order-setup-eat-in-details/order-setup-eat-in-details.vue'

const {latitude, longitude} = require('@/' + process.env.VUE_APP_REGION + '.yml')

/**
 * Export components pre-configured with required dependencies
 */
// Basket
export const Basket = ContainerFactory(NandosOrderingBasket, injectableDependencies)
export const CheckoutInstructions = ContainerFactory(NandosOrderingCheckoutInstructions, injectableDependencies)
// Menu
export const Menu = ContainerFactory(NandosOrderingMenu, injectableDependencies)
	export const MenuItemListing = NandosOrderingMenuItemListing
export const Product = ContainerFactory(NandosOrderingProduct, injectableDependencies)
	export const ProductConfigurator = NandosOrderingProductConfigurator
export const ProductNutritionalInfo = ContainerFactory(NandosOrderingProductNutritionalInfo, injectableDependencies)
// Order setup
export const OrderSetup = ContainerFactory(NandosOrderingOrderSetup, {mapCenterDefault: {latitude, longitude}, ...injectableDependencies})
export const OrderSetupType = ContainerFactory(NandosOrderingOrderSetupType, injectableDependencies)
export const OrderSetupAddress = ContainerFactory(NandosOrderingOrderSetupAddress, injectableDependencies)
export const OrderSetupAddressDetails = ContainerFactory(NandosOrderingOrderSetupAddressDetails, injectableDependencies)
export const OrderSetupStore = ContainerFactory(NandosOrderingOrderSetupStore, injectableDependencies)
export const OrderSetupEatInLanding = ContainerFactory(NandosOrderingOrderSetupEatInLanding, injectableDependencies)
export const OrderSetupEatInDetails = ContainerFactory(NandosOrderingOrderSetupEatInDetails, injectableDependencies)