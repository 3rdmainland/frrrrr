import Vue from 'vue'
import {MENU_CHANGED} from 'nandos-middleware-api/service/menu/menu-service'
import {
    FAMILY_TYPE_GENERIC,
    FAMILY_TYPE_FLAVOUR,
    FAMILY_TYPE_SIDE,
    FAMILY_TYPE_DRINK
} from 'nandos-middleware-api/model/user-product'
import EXCLUSION_TYPES from 'nandos-middleware-api/model/product-exclusion-types'
import {Restoreable} from 'nandos-core-ui'
import {nextTick, requestTimeout} from 'nandos-timing-utils'
import {menuServiceKey, isPreviewKey} from '../../../../utils/ordering-provider-utils'
import ProductConfiguratorChecklist from "./product-configurator-checklist.vue";

export default {
    components: {ProductConfiguratorChecklist},

    inject: {
        menuService: menuServiceKey,
        preview: isPreviewKey,
    },

    mixins: [Restoreable],

    props: {
        productDefinitionId: String,
        productNutritionalUrl: String,
        relatedProductId: String,
        basket: {required: true},
        rootUrl: {type: String},
        atRoot: {type: Boolean},
        showValidationErrors: {type: Boolean},
        useSplitLayout: {type: Boolean},
    },

    data() {
        return {
            WARN_ABOUT_DELIVERY_PRICING: process.env.VUE_APP_WARN_ABOUT_DELIVERY_PRICING,
            EXCLUSION_TYPES,
            userProduct: null,
            showNutritionalInfoUnavableForSelectionPopup: false,
            showSubItemConfigurator: true,
            halfAndHalfMode:false
        }
    },

    computed: {

        // Used to seed Placeholder Background
        seed() {
            return this.productDefinitionId
                .split('')
                .reduce((acc, next) => acc += next.charCodeAt(0), 0)
        },

        ready() {
            return this.basket && this.userProduct != null
        },

        page_classes() {
            if (!this.ready) return '';
            let family = this.userProduct.getProductFamily()

            return {
                'product-configurator': true,
                'split-layout': this.useSplitLayout,
                'product-configurator--at-root transparent': this.atRoot,
                'product-configurator--is-flavour-selection': this.productIsFlavourSelection,
            }
        },

        pageTitle() {
            return this.userProduct ? this.userProduct.getShortName() : ''
        },

        backTitle() {
            return this.userProduct && this.userProduct.getParent()
                ? this.userProduct.getParent().getShortName()
                : 'Menu'
        },

        productIsFlavourSelection() {
            if (!this.ready) return
            return this.userProduct.isFlavourContainer()
        },

        nutritionalOrAllergenInfoAvailable() {
            return this.userProduct.hasNutritionalInfo() ||
                this.userProduct.hasAllergenInfo() ||
                (this.userProduct.getSelectedProducts().filter(rp => rp.hasNutritionalInfo()).length > 0) ||
                (this.userProduct.getSelectedProducts().filter(rp => rp.hasAllergenInfo()).length > 0)
        },
    },

    created() {
        this.getProductData()
            .then(() => this.restoreState())

        this.menuService.addObserver(this, MENU_CHANGED, () => this.getProductData())
    },

    methods: {

        getProductData() {
            return this.menuService.retrieveUserProductFromDefinitionId(this.productDefinitionId)
                .then(userProduct => {
                    this.userProduct = userProduct
                    if (this.relatedProductId) {
                        this.userProduct = userProduct.getRelatedProduct(this.relatedProductId)
                    }
                })
        },

        selectProduct(userProduct, forceStayOnScreen = false) {
            if (userProduct.isLeaf()) {
                // Toggle the selected state (unless flavour, where we don't allow toggle, or unavailble, where we only allow de-selecting)
                let newSelectedState
                if (this.productIsFlavourSelection)
                    newSelectedState = true
                else
                    newSelectedState = userProduct.isAvailable() ? !userProduct.isSelected() : false

                userProduct.setSelected(newSelectedState)

                // If forceStayOnScreen is true, or if this configuration allows multiple selections, don't navigate away
                if (forceStayOnScreen || (userProduct.getParent() && userProduct.getParent().canMultiSelect())) {
                    this.$emit('force-parent-update')
                    this.$forceUpdate() // Manually trigger a UI update, because Vue doesn't track changes to the user product's internal state object
                    return
                }

                this.goToClosestInvalidNode(userProduct)
            } else {
                userProduct = userProduct.collapse()
                if (userProduct.isLeaf()) // if we have collapsed to a leaf, go back up one level to the leaf's parent
                    userProduct = userProduct.getParent()

                this.$router[this.$props.atRoot ? 'push' : 'replace']({
                    path: `${this.$route.path}/${userProduct.getIdPath()}`,
                    query: Object.assign({}, this.$route.query)
                })
            }
        },

        /**
         * Navigate back up the product tree until we find a node that has not been configured yet
         * @param  {UserProduct} userProduct The current product node
         * @param  {Boolean}     force       Ensure that we go up at least one level
         */
        goToClosestInvalidNode(userProduct, force) {
            this.showSubItemConfigurator = false;
            let paths = this.$route.path.split('/');
            let root = userProduct.getRoot();
            let current = userProduct;

            while (force || (current && (!current.canMultiSelect() || current.multiSelectIsConfigured()) && current.getParent() && current.isValidState())) {
                let idUp = paths[paths.length - 2]
                current = root.getRelatedProduct(idUp);
                if (current || idUp == root.getIdPath())
                    paths.pop();
                force = false
            }

            let nextPath = paths.join('/')
            let willNavigate = this.$route.path != nextPath

            // always force an update to handle the new split router view layout
            this.$emit('force-parent-update')
            this.$forceUpdate()

            if (willNavigate) {

                setTimeout(() => {
                    this.$router[this.$props.atRoot ? 'push' : 'replace']({path: nextPath, query: this.$route.query});
                }, 250) // allow time for the transitions to complete
            }
        },

        goToRoot() {
            this.showSubItemConfigurator = false;
            setTimeout(() => {
                this.$router.push({path: this.rootUrl, query: this.$route.query});
            }, 250) // allow time for the transitions to complete
        },

        onDoneBtnClicked(e) {
            this.userProduct.setSelected(true) // allows user to select unconfigured products (required to work around weird OHEICS product structure)
            this.showSubItemConfigurator = false;
            this.$emit('force-parent-update')
            this.$forceUpdate()
            if (this.$refs.checklist) {
                this.$refs.checklist.$forceUpdate()
            }
            this.$nextTick(() =>
                this.goToClosestInvalidNode(this.userProduct, true)
            )
        },

        onRemoveBtnClicked(e) {
            this.userProduct.setSelected(false) // allows user to deselect configured products
            this.showSubItemConfigurator = false;
            this.$emit('force-parent-update')
            this.$forceUpdate()
            if (this.$refs.checklist) {
                this.$refs.checklist.$forceUpdate()
            }
            this.$nextTick(() => this.goToClosestInvalidNode(this.userProduct, true))

        },

        exitFlavourSelection() {
            this.goToClosestInvalidNode(this.userProduct, true)
        },

        getListItemTitleClasses(childProduct) {
            return {
                // 'yellow': childProduct.getFeatures().some(feature => feature.id == 'highlighted-config')
            }
        },

        displayNutritionalInfoUnavableForSelectionPopup() {
            this.showNutritionalInfoUnavableForSelectionPopup = true
            requestTimeout(() => this.showNutritionalInfoUnavableForSelectionPopup = false, 3000)
        },

        restoreState() {
            this.$restoreScrollPosition()
        },
    },

    beforeDestroy() {
        this.menuService.removeObserver(this, MENU_CHANGED)
    }
}