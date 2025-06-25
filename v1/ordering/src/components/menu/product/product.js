import Vue from 'vue'
import {ViewStateService, PlaceholderBackground} from 'nandos-core-ui'
import Tracker from '../../../e-commerce-tracker-adapter'
import ProductUpseller from './product-upseller/product-upseller.vue'
import {provideCommonServices} from '../../../utils/ordering-provider-utils'
import ProductConfigurator from "./product-configurator/product-configurator";

export default {

    name: 'Product',
    components: {ProductConfigurator},

    mixins: [PlaceholderBackground],

    props: {
        menuService: {type: Object, required: true},
        basketService: {type: Object, required: true},
        globalConfigService: {type: Object, required: true},
        languageService: {type: Object, required: true},

        productDefinitionId: {type: String, required: true},
        preview: {type: Boolean},
    },

    provide: provideCommonServices,

    data() {
        return {
            pageTransition: '',
            add_in_progress: false,
            userProduct: null,
            basket: null,
            relatedBasketItemId: this.$route.query.relatedBasketItemId, // the basket item related to the product (only used when editing)
            show_validation_errors: false,
            view_state: ViewStateService,
            doHeaderAnimation: true,
        }
    },

    computed: {
        ready() {
            return this.userProduct != null && this.basket != null;
        },

        atRoot() {
            return this.isRootUrl(this.$route.path)
        },

        edit() {
            return this.relatedBasketItemId != null;
        },

        useSplitLayout() {
            return this.$breakpoints.mdUp
        },

        // Used to seed Placeholder Background mixin
        seed() {
            return this.productDefinitionId
                .split('')
                .reduce((acc, next) => acc += next.charCodeAt(0), 0)
        },

        rootUrl() {
            let prefix = this.$route.path.split('/configure').shift()
            return `${prefix}/configure/${this.productDefinitionId}`
        },

        nutritionalUrl() {
            return `${this.rootUrl}/nutrition`
        },
    },

    watch: {

        $route(to, from) {
            if (this.isRootUrl(to.path)) {
                this.pageTransition = 'page-slide-down'
            } else if (this.isRootUrl(from.path)) {
                this.pageTransition = 'page-slide-up'
                this.doHeaderAnimation = false
            } else {
                const toDepth = to.path.split('/').length
                const fromDepth = from.path.split('/').length
                this.pageTransition = toDepth < fromDepth ? 'page-slide-left-to-right' : 'page-slide-right-to-left';
            }
        }
    },

    created() {
        let promises = [this.menuService.retrieveUserProductFromDefinitionId(this.productDefinitionId), this.basketService.getBasketSummary(), this.globalConfigService.getConfigs()]

        if (this.edit)  // When in edit mode, we also need to retrieve the basket item associated with this product
            promises.push(this.basketService.getBasketItem(this.relatedBasketItemId))

        Promise.all(promises)
            .then(([userProduct, basket, configs, basketItem]) => {
                if (!userProduct) return this.$router.replace({name: this.preview ? 'preview-menu' : 'menu'});
                this.userProduct = userProduct;
                this.basket = basket;
                if (basketItem)
                    userProduct.configureFromBasketItem(basketItem);

                if (!basket.isOrderSetup && !!configs.forceOrderSetupBeforeAddToBasket) {
                    this.$toaster.show("Set up your order before we get cookin’", {error: true, parent: this});
                    if(this.$route.query.m){ // hack to enable the setup to be cancelled when the user redirects back without the order being setup
                        return this.$router.replace({
                            name: 'menu',
                        })
                    }
                    return this.$router.replace({
                        name: 'order-setup-start',
                        query: {redirect: this.$route.fullPath + "?m=true", jump: true}
                    })
                }

                Tracker.track('productView', this.userProduct)
            })
            .catch(e => this.$router.replace({name: this.preview ? 'preview-menu' : 'menu'}))
    },

    methods: {

        isRootUrl(url) {
            return url.split('/').pop() === this.productDefinitionId;
        },

        addToBasket() {

            if (!this.userProduct.isValidState()) {
                this.showValidationErrors();
                this.$toaster.show(this.$t('productDetail.addToBasket.invalidSelection'), {error: true, parent: this});
            } else if (this.preview) {
                return this.$toaster.show('Basket unavailable during preview')
            } else {
                this.add_in_progress = true;
                Promise.all([this.basketService.getBasketSummary(), this.globalConfigService.getConfigs()])
                    .then(([basket, configs]) => {
                        // if(configs.forceOrderSetupBeforeAddToBasket == true && basket.isOrderSetup == false) {
                        //   this.$toaster.show("Set up your order before we get cookin’", {error: true, parent: this});
                        //   return this.$router.push({name: 'order-setup-start', query: {redirect: this.$route.fullPath, jump: true}})
                        // }

                        let action = this.edit
                            ? this.basketService.updateBasketItem(this.relatedBasketItemId, this.userProduct)
                            : this.basketService.addBasketItem(this.userProduct);

                        return action
                            .then(() => {
                                if (this.edit) {
                                    this.$toaster.show(this.$t('productDetail.addToBasket.update.success'), {
                                        success: true,
                                        parent: this
                                    })
                                } else {
                                    Tracker.track('addToCart', this.userProduct)
                                    let props = {
                                        product: this.userProduct,
                                        menuService: this.menuService,
                                        basketService: this.basketService,
                                        languageService: this.languageService,
                                        globalConfigService: this.globalConfigService,
                                        parent: this
                                    }
                                    // let upseller = this.$toaster.showInstance(Vue.extend(ProductUpseller), props)
                                    // If there are no upsells to display, we will display a normal toast with a "added to your basket" message
                                    // let fallbackMsg = this.$t('productDetail.addToBasket.new.success')
                                    // upseller.$once('upsells-retrieved', (count) => {
                                    //     if (count == 0) this.$toaster.show(fallbackMsg, {success: true, parent: this})
                                    // })
                                    this.$toaster.show(this.$t('productDetail.addToBasket.new.success'), {success: true, parent: this})
                                }

                                this.$router.push(this.$route.query.redirect || ({name: this.preview ? 'preview-menu' : 'menu'}));
                            })
                            .catch(e => this.$toaster.show(this.$t('productDetail.addToBasket.serverError'), {
                                error: true,
                                parent: this
                            }))
                    })
                    .finally(() => this.add_in_progress = false)
            }
        },

        showValidationErrors() {
            this.show_validation_errors = true;
            if (!this.atRoot) {
                this.$router.push(this.rootUrl)
            }
        },

        beforeRouteUpdate(to, from, next) {
            next(vm => {
                console.log(from)
                vm.prevRoute = from;
            });
        },

        beforePageEnter(){
            // Prevent scrollbars on page during route transition animation
            if (this.$refs.rootProductConfigPage) {
                this.$refs.rootProductConfigPage.$el.querySelector('.page__content').style.overflow = 'hidden'
            }
            this.$el.querySelector('.page__content').style.overflow='hidden'

        },

        afterPageLeave(){
            if (this.$refs.rootProductConfigPage) {
                this.$refs.rootProductConfigPage.$el.querySelector('.page__content').style.overflow = ''
            }
            this.$el.querySelector('.page__content').style.overflow=''
        },

        beforePageLeave() {
            // Prevent scrollbars on page during route transition animation
            if (this.$refs.productConfigPage && this.$refs.productConfigPage.$el.querySelector('.page__content')) {
               this.$refs.productConfigPage.$el.querySelector('.page__content').style.overflow = 'hidden'
            }
        },

        afterPageEnter(e) {
            // Prevent scrollbars on page during route transition animation
            if (this.$refs.productConfigPage && this.$refs.productConfigPage.$el.querySelector('.page__content')) {
                this.$refs.productConfigPage.$el.querySelector('.page__content').style.overflow = ''
            }
        },

        triggerUpdates(){
            if (this.$refs.rootProductConfigPage) {
                this.$refs.rootProductConfigPage.$forceUpdate()
            }
            this.$forceUpdate()
        }
    }
}