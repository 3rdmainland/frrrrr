import SnippetService from 'nandos-middleware-api/service/snippet-service'
import EXCLUSION_TYPES from 'nandos-middleware-api/model/product-exclusion-types'
import OrderTypeKey from 'nandos-i18n/src/filters/order-type-key'
import Tracker from '../../e-commerce-tracker-adapter'
import HeroImageFromBasket from '../../mixins/hero-image-from-basket'
import {ORDER_TYPES} from 'nandos-middleware-api/model/food-basket'
import {getMenuItemUrl} from '../menu/menu-tile/menu-tile.js'
import {provideCommonServices} from '../../utils/ordering-provider-utils'

import {BASKET_CONTENTS_CHANGED} from 'nandos-middleware-api/service/basket/basket-service'
import NSelect from "nandos-core-ui/src/components/forms/select.vue";
import FreeProductSelector from "./free-product-selector.vue";

export default {
    components: {FreeProductSelector, NSelect},

    mixins: [HeroImageFromBasket],

    props: {
        menuService: {type: Object, required: true},
        basketService: {type: Object, required: true},
        customerService: {type: Object, required: true},
        globalConfigService: {type: Object, required: true},
        languageService: {type: Object, required: true},
    },

    provide: provideCommonServices,

    data() {
        return {
            EXCLUSION_TYPES,
            anonymousCustomerPromptSnippet: null,
            guestCheckoutAuthPromptDialogSnippet: null,
            ORDER_TYPES,
            basket: null,
            customer: null,
            configs: null,
            autoComboMatches: null,
            upsells: null,
            recommendedProducts: null,
            removing: null,
            loading: false,
            selectedCampaign: null,
            showCompaignDetails: false,
            showAuthPrompt: false,
            selectedAutoComboItem: null,
            showAutoComboSwitchDialog: false,
            loadingAutoComboItemSwitch: false,
            CALL_CENTER_PHONE: process.env.VUE_APP_CALL_CENTER_PHONE,
            SHOW_VAT_DISCLAIMER: process.env.VUE_APP_SHOW_VAT_DISCLAIMER,
            freeProducts: [],
            showFreeProductDialog: false,
            loadingFreeProductSelection: false,
        }
    },

    computed: {
        ready() {
            return this.basket != null && this.customer != null && this.configs != null
        },
        selectedFreeProduct() {
            return this.basket.selectedFreeProductCampaignItem
        },

        hasOutstandingFreeProductSelections() {
            return this.freeProducts.length > 0 && this.basket.selectedFreeProductCampaignItem === null
        },

        canPlaceOrder() {
            return this.ready && this.basket.canCheckout
        },

        // Before we go to the next step (checkout instruction or payment) prompt the customer to optionally sign in
        promptOptionalAuthBeforeNext() {
            return this.customer.anonymous && this.basket.allowGuestCheckout
        },

        kerbsideOnlyCollection() {
            return this.configs.kerbsideOnlyCollection == true
        },

        showFooter() {
            return this.$breakpoints.xs || this.$breakpoints.sm
        },

        displaySummaryColumn() {
            return this.ready && !this.basket.isEmpty && !this.showFooter
        },

        /**
         * If there are no upsells or auto-combo matches to display, show the user recommended products instead
         */
        displayRecommendedProducts() {
            return (this.upsells && this.upsells.length == 0) && (this.autoComboMatches && this.autoComboMatches.length == 0)
        },

        regionSupportsAutoCombo() {
            return this.ready && this.configs.suggestComboUpgrade
        },

        hasAutoComboMatches() {
            return this.autoComboMatches && this.autoComboMatches.length > 0
        },

        hasUpsells() {
            return this.upsells && this.upsells.length > 0
        },

        hasRecommendedProducts() {
            return this.recommendedProducts && this.recommendedProducts.length > 0
        },

        selectedAutoComboItemPlaceholderSeed() {
            return this.selectedAutoComboItem.comboProduct.id
                .split('')
                .reduce((acc, next) => acc += next.charCodeAt(0), 0)
        },

        carouselSlidesPerPage() {
            return this.$breakpoints.xs ? 1 : 2
        },

        orderTypeKey() {
            return OrderTypeKey(this.basket)
        },
    },


    watch: {
        'basket.items'() {
            if (this.displayRecommendedProducts)
                this.getRecommendedProducts()
            if (this.regionSupportsAutoCombo)
                this.getAutoComboSuggestions()

            this.getUpsells()
        },

        displayRecommendedProducts(val) {
            if (val == true) this.getRecommendedProducts()
        },

        regionSupportsAutoCombo(val) {
            if (val == true) this.getAutoComboSuggestions()
        },


    },

    created() {

        this.basketService.addObserver(this, BASKET_CONTENTS_CHANGED, this.getBasket);

        Promise.all([this.getBasket(), this.customerService.getMe(), this.globalConfigService.getConfigs()])
            .then(([basket, customer, configs]) => {
                this.customer = customer
                this.configs = configs
                //
                if (customer.anonymous) {
                    SnippetService.getSnippet('basket-anonymous-customer-prompt')
                        .then(snippet => this.anonymousCustomerPromptSnippet = snippet)
                        .catch(e => {
                        })
                }
                if (this.promptOptionalAuthBeforeNext) {
                    SnippetService.getSnippet('guest-checkout-auth-prompt-dialog')
                        .then(snippet => this.guestCheckoutAuthPromptDialogSnippet = snippet)
                        .catch(e => {
                        })
                }
                // Analytics
                if (!basket.isEmpty) Tracker.track('checkout', 1, basket)
            })


    },

    methods: {
        getBasket() {
            return this.basketService.getBasket()
                .then(basket => {
                    this.basket = basket;
                    console.log("Basket loaded in getBasket:", JSON.stringify(this.basket));
                    // Extract free products from matched campaigns with free product selection required
                    if (basket.matchedCampaigns && basket.matchedCampaigns.length > 0) {
                        const campaignWithFreeProducts = basket.matchedCampaigns.find(
                            campaign => campaign.freeProductsSelection && campaign.freeProductsSelection.length > 0
                        );

                        if (campaignWithFreeProducts) {

                            this.freeProducts = campaignWithFreeProducts.freeProductsSelection.map(product => {
                                return {
                                    label: product.name,
                                    value: product.posProviderRef
                                };
                            });

                        }
                    }
                })
                .catch(error => console.error("Error loading basket:", error));
        },

        editItem(basketItem) {
            this.menuService.retrieveUserProduct(basketItem.productId)
                .then(product => this.$router.push(getMenuItemUrl(product, this.$route, false, {
                    relatedBasketItemId: basketItem.id,
                    redirect: this.$route.fullPath,
                    jump: true
                })))
        },

        removeItem(item) {
            this.removing = item
            this.basketService.removeBasketItem(item.id)
                .then(() => {
                    Tracker.track('removeFromCart', item)
                })
                .then(() => {
                    this.removing = null
                    this.$toaster.show(this.$t('basket.itemRemoved'), {parent: this})
                })
        },

        getAutoComboSuggestions() {
            return this.menuService.getAutoComboMatches(this.basket)
                .then(autoComboMatches => {
                    this.autoComboMatches = autoComboMatches.slice(0, 5)
                    this.autoComboMatches.forEach(autoCombo => autoCombo.trackingCategory = 'basket/auto-combo') // augment with category data for tracking
                })
        },

        getUpsells() {
            return this.menuService.getUpsells(this.basket)
                .then(upsells => {
                    this.upsells = upsells.slice(0, 5)
                    this.upsells.forEach(upsell => upsell.item.trackingCategory = 'basket/upsell') // augment with category data for tracking
                })
        },

        getRecommendedProducts() {
            return this.menuService.getRecommendedProducts(5)
                .then(products => this.recommendedProducts = products.filter(product => !this.basket.items.find(basketItem => basketItem.productId == product.id)))
        },

        confirmUseOfAutoComboItem(item) {
            this.showAutoComboSwitchDialog = true
            this.selectedAutoComboItem = item
        },

        abortAutoComboSwitch() {
            this.showAutoComboSwitchDialog = false
            this.selectedAutoComboItem = null
        },

        addSelectedFreeProductToBasket(item,shouldToast = false) {
            this.loading = true
            this.basket.selectedFreeProductCampaignItem = item.value
            this.basketService.addSelectedFreeProductToBasket(item)
                .then(() => shouldToast && this.$toaster.show(this.$t('basket.useAutoComboItem', {amount: this.$options.filters.money(item.savings)}), {
                    parent: this,
                    success: true
                }))
                .then(() => {
                    this.loading = false
                })
        },

        useAutoComboItem(item) {
            this.loadingAutoComboItemSwitch = true
            this.basketService.addAutoComboItem(item)
                .then(() => this.$toaster.show(this.$t('basket.useAutoComboItem', {amount: this.$options.filters.money(item.savings)}), {
                    parent: this,
                    success: true
                }))
                .then(() => {
                    this.loadingAutoComboItemSwitch = false
                    this.showAutoComboSwitchDialog = false
                })
        },

    },

    beforeDestroy() {
        if (this.$refs.myElement) {
            this.$refs.myElement.removeEventListener('click', this.handleClick);
        }
    },
}