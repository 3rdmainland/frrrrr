import logger from 'nandos-dev-logger'

export const FAMILY_TYPE_GENERIC = 'generic'
export const FAMILY_TYPE_FLAVOUR = 'flavour'
export const FAMILY_TYPE_SIDE = 'side'
export const FAMILY_TYPE_DRINK = 'drink'

const flavourMappings = {
    'xtra-hot': null,
    'hot': null,
    'mild': null,
    'mozam-paprika': ['mozam'],
    'lemon-and-herb': ['lemon-herb'],
    'tangy-tomato': ['tomato'],
    'plain-ish': ['plainish'],
    'no-sauce': ['nosauce'],
}

export default class Product {

    constructor(data, parent, product_root, productDefinitionsMap) {

        if (data.productDefinitionId == null)
            logger.error('Nandos Middleware', 'This product has no corresponding PRODUCT_DEFINITION', data)

        this.parent = parent;
        this.root = product_root || this;
        this.root.relatedProductsMap = this.root.relatedProductsMap || {};

        this.id = data.id;
        this.productType = data.productType;

        if (this.productType == "COMBO_MAIN" && data.relatedProducts && data.relatedProducts.length > 1) {
            this.productType = "MULTI_COMBO_MAIN";
        }

        if (this.productType == "CONDIMENT" && data.relatedProducts && data.relatedProducts.length > 0) {
            this.productType = null;
        }

        if (this.parent && this.parent.productType == "COMBO_MAIN" && this.productType == "SIMPLE") {
            this.root.comboMain = this;
        }

        this.price = data.price || 0;
        this.userRelevance = 0;
        this.userFlavourPreference = null;
        this.quantity = data.quantity;
        this.default = data.default || false;
        this.mandatory = data.mandatory || false;
        this.hasMandatory = false;

        this.definition = productDefinitionsMap[data.productDefinitionId];
        if (this.definition) {
            this.definitionId = this.definition.id;
            this.name = this.definition.name;
            this.shortName = this.definition.shortName;
            this.description = this.definition.description;
            this.keywords = this.parent ? this.definition.autoconfigKeywords : this.definition.searchKeywords;
            this.generalDisclaimer = this.definition.generalDisclaimer;
            this.deliveryDisclaimer = this.definition.deliveryDisclaimer;
            this.imageCollection = this.definition.imageCollection
            this.badge = this.definition.badge;
            this.accentColor = this.definition.accentColor;
            this.features = this.definition.features
            this.searchBias = this.definition.searchBias;
            this.hasNutritionalInfo = this.definition.hasNutritionalInfo;
            this.nutritionalInfo = this.definition.nutritionalComponents;
            this.hasAllergenInfo = this.definition.hasAllergenInfo;
            this.allergens = this.definition.allergens;
            this.servingSize = this.definition.servingSize;
            this.upsells = this.definition.upsells;
        }

        /**
         * The id we will use as part of a URL
         * To make product detail URLs work consistently across menus, we use the product's definition ID (shared across menus)
         * For related products (child products), we just use the product's id
         */
        this.idPath = this.isRoot() ? this.definitionId : this.id

        if (data.relatedProducts) {
            this.relatedProducts = data.relatedProducts.map(p => new Product(p, this, this.root, productDefinitionsMap))
        }

        if (this.parent && this.mandatory) {
            this.parent.hasMandatory = true;
        }

        this.root.relatedProductsMap[this.id] = this;

        this._handleFlavors();
    }

    isAvailable() {
        return this.isLeaf()
            ? this.definition.isAvailable
            : this.definition.isAvailable && this.relatedProducts.some(rp => rp.isAvailable())
    }

    isHiddenByExclusion() {
        return this.isLeaf()
            ? this.definition.isHiddenByExclusion
            : this.definition.isHiddenByExclusion || this.relatedProducts.every(rp => rp.isHiddenByExclusion()) // if all children are hidden, mark the parent as hidden
    }

    getExclusions() {
        return this.definition.exclusions
    }

    isHidden(state) {
        if (this.cloneContainerSource) {
            let selectedChildren = this.relatedProducts
                .filter(r => r.isSelected(state))
                .length;
            if (selectedChildren == 0) return true;
        }

        return false;
    }

    isSelectable() {
        let result = this.isAvailable() && (this.productType == "SIMPLE" || this.productType == "CONDIMENT") || (this.isLeaf() && this.productType != "COMBO_MAIN")

        if (result && this.relatedProducts && (this.mandatory || this.hasMandatory)) {
            result = false;
        }

        return result;
    }

    isSelected(state) {
        if (this.proxyTo) {
            return false;
        } else if (this.virtual) {
            if (this.relatedProducts) {
                return this.relatedProducts.filter(rp => !rp.proxyTo).find(rp => state.isSelected(rp));
            }
        } else if (this.cloneContainerSource && this.parent && this.parent.cloneContainerSource) {
            if (this.relatedProducts) {
                return this.relatedProducts.find(rp => state.isSelected(rp));
            }
        }

        return state.isSelected(this) || this.isRoot() || this.productType === 'COMBO_MAIN' || this.isAlwaysSelected(state);
    }

    setSelected(state, value) {
        if (value) {
            this.select(state);
        } else {
            this.deselect(state)
        }
    }

    select(state) {

        if (this.proxyTo) {
            return this.proxyTo.select(state);
        }

        if (this.isHidden(state)) {
            return;
        }

        if (state.isSelected(this)) return;

        if (this.parent) {
            if (this.parent.quantity == 1) {
                this.parent.relatedProducts.forEach(r => r.deselect(state));
            }
            this.parent.select(state);
        }

        state.setSelected(this, true);

        if (this.cloneTargetProduct) {
            state.setSelected(this.cloneTargetProduct, true);
        } else if (this.parent && this.parent.cloneContainerTarget) {
            this.parent.cloneContainerTarget.deselect(state);
        } else if (this.parent && this.parent.parent && this.parent.parent.cloneContainerTarget) {
            this.parent.parent.cloneContainerTarget.deselect(state);
        }
    }

    deselect(state) {

        if (this.proxyTo) {
            return this.proxyTo.deselect(state);
        }

        if (this.virtual) {
            if (this.isSelected(state)) return;
        } else if (!state.isSelected(this) || !this.parent) return;

        let selectedSiblings = this.parent.relatedProducts
            .filter(r => r.isSelected(state) && r.id != this.id)
            .length;

        if (selectedSiblings == 0) {
            this.parent.deselect(state);
        }

        state.setSelected(this, false);

        if (this.relatedProducts && !this.cloneContainerSource) {
            this.relatedProducts.forEach(r => r.deselect(state));
        }

        if (this.cloneTargetProduct) {
            state.setSelected(this.cloneTargetProduct, false);
        }
    }

    traverse(state, filter, result = []) {
        if (!filter || filter(this, state)) {
            result.push(this);
            if (this.relatedProducts) {
                this.relatedProducts.forEach(rp => rp.traverse(state, filter, result));
            }
        }

        return result;
    }

    getSelectedProducts(state) {
        return this.traverse(state, (p, s) => p.isSelected(s))
    }

    getConfigurationDescription(state, fromId) {
        fromId = fromId || this.id;
        let descriptors = [];

        if (this.isSelected(state)) {

            if (this.relatedProducts) {
                this.relatedProducts.forEach(p => {
                    descriptors = descriptors.concat(p.getConfigurationDescription(state, fromId));
                });
            }

            if (this.productType) {
                if (!this.parent || this.id == fromId) {
                    if (descriptors.length > 0) {
                        descriptors = [descriptors.join(", ")];
                    }
                } else if (this.productType == "SIMPLE") {
                    if (this.parent && this.parent.productType == "COMBO_MAIN" && descriptors.length > 0) {
                        descriptors = [`${descriptors.join(", ")}`];
                    } else {
                        let desc = this.shortName;
                        if (descriptors.length > 0) {
                            desc = `${desc} (${descriptors.join(", ")})`;
                        }
                        descriptors = [desc];
                    }
                } else if (this.productType == "CONDIMENT") {
                    if (this.parent.cloneContainerSource) {
                        descriptors = [this.parent.shortName + ": " + this.shortName];
                    } else {
                        descriptors = [this.halfAndHalfName || this.shortName];
                    }
                } else {
                    if (descriptors.length > 0) {
                        descriptors = [descriptors.join(", ")];
                    }
                }
            }
        }

        return !this.parent || this.id == fromId ? descriptors.join(" - ") : descriptors;
    }

    computePrice(state) {
        if (this.isSelected(state)) {
            return this.getSelectedProducts(state)
                .map(p => p.price)
                .reduce((sum, val) => sum + val, 0);
        } else {
            return this.price ? this.price : this.collapse().price;
        }
    }

    // Return all exclusions from products that are selected, but unavailable
    computeSelectedExclusions(state) {
        return this.getSelectedProducts(state)
            .filter(p => !p.isAvailable()) // find only unavailable products
            .map(p => p.getExclusions())
            .reduce((prev, curr) => prev.concat(curr), []) // flatten
            .filter((item, idx, arr) => arr.indexOf(item) == idx) // dedupe
    }

    isAlwaysSelected(state) {
        return this.parent.isSelected(state) && this.mandatory == true && this.collapse().isLeaf();
    }

    isConfigured(state) {
        return this.isValidState(state) && this.isSelected(state);
    }

    isValidState(state) {
        return this.getInvalidProducts(state).length === 0;
    }

    getInvalidProducts(state) {
        return this.traverse(state, (p, s) => p.requiresSelection() || p.isSelected(state)) // `p.isSelected(state)` is here to ensure the full selection chain is returned
            .filter(p => !p.isSelected(state) || !p.isAvailable())
    }

    requiresSelection() {
        return this.mandatory || this.isRoot() || this.productType === 'COMBO_MAIN' || this.productType === 'MULTI_COMBO_MAIN'
    }

    /**
     * Returns true when a multi-select node has had all its options chosen (all optional and mandatory nodes)
     */
    multiSelectIsConfigured(state) {
        let expectedQuantity = this.relatedProducts.length
        return expectedQuantity == this.relatedProducts
            .filter(p => p.isSelected(state))
            .length
    }

    isRoot() {
        return this.parent == null;
    }

    getRelatedProduct(id) {
        return this.root.relatedProductsMap[id];
    }

    hasRelatedProducts() {
        return this.relatedProducts && this.relatedProducts.length >= 1;
    }

    getRelatedProducts(originalStructure = false) {
        let result = this.relatedProducts;
        if (originalStructure && this.halfAndHalfContainer && result) {
            result = result.filter(rp => rp.relatedProducts).reduce((a, rp) => a.concat(rp.relatedProducts), []).filter(rp => !rp.proxyTo);
        }

        return result;
    }

    isLeaf() {
        return this.cloneContainerSource || this.relatedProducts == null || !this.relatedProducts.length;
    }

    hasSubTrees() {
        return this.relatedProducts && this.relatedProducts.find(rp => !rp.isLeaf()) != null
    }

    onlyHasLeaves() {
        return this.relatedProducts && this.relatedProducts.find(rp => !rp.isLeaf()) == null
    }

    configureFromBasketItem(basketItem, state) {
        state.setSelected(this, true);

        if (basketItem.subItems) {
            basketItem.subItems.forEach(subItem => {
                let child = this.getRelatedProduct(subItem.productId);
                if (child) child.configureFromBasketItem(subItem, state);
            })
        }

        return state;
    }

    applyCustomerBehaviour(behaviour) {
        this.userRelevance = behaviour.score

        if (this.relatedProducts && behaviour.subItems) {
            behaviour.subItems.forEach(subItem => {
                let child = this.relatedProducts.find(rp => rp.definitionId == subItem.productDefinitionId)
                if (child) child.applyCustomerBehaviour(subItem)
            })
        }
    }

    collapse() {
        if (this.relatedProducts && this.relatedProducts.length == 1) {
            return this.relatedProducts[0].collapse();
        }

        return this;
    }

    isFlavourContainer() {
        return this._isFlavor() && this.hasRelatedProducts() && !this._isExtra() && !this._isHalfAndHalf();
    }

    isSideConatiner() {
        return /(side)/gi.test(this.name) && !this.isLeaf();
    }

    /**
     * Returns only simple leaf products (products that can be added without additional configuration) that are available
     */
    canBeQuickPicked() {
        return this.isAvailable() && this.productType == "SIMPLE" && this.isLeaf()
    }

    /**
     * Returns relatedProducts (children) that can be quick picked at no additional cost
     */
    getQuickPickChildren(state, maxItems = Number.POSITIVE_INFINITY) {
        return this.traverse(state, (p, s) => p.isAvailable() && p.price == 0)
            .filter(p => p.canBeQuickPicked())
            .slice(0, maxItems)
    }

    /**
     * Returns the family the product belongs to.
     * 'drink', 'side', 'flavour' or 'generic'
     */
    getProductFamily() {
        // We don't look up the parent chain for `flavour` because that causes trouble :/
        if (this.isFlavourContainer()) {
            return FAMILY_TYPE_FLAVOUR
        }

        let product = this

        while (product.parent) {
            let name = product.name.toLowerCase()
            if (name.includes('drink')) return FAMILY_TYPE_DRINK
            else if (name.includes('side')) return FAMILY_TYPE_SIDE
            product = product.parent
        }

        return FAMILY_TYPE_GENERIC
    }

    getNormalisedFlavourCode() {
        let sanitized = this.name
            .toLowerCase()
            .replace(/\//g, '')
            .trim()
            .replace(/ /g, '-')
            .replace(/(\&|\+)/g, 'and')
            .replace(/plain$/g, 'no-sauce')
            .replace(/extra/g, 'xtra')

        let remapped = Object.entries(flavourMappings)
            .find(([key, alternatives]) => sanitized == key || (alternatives && alternatives.includes(sanitized)))

        return remapped ? remapped[0] : sanitized
    }

    generateSelectionIdentifier(state) {
        return this.getSelectedProducts(state)
            .map(p => p.id)
            .sort()
            .toString()
    }

    _handleFlavors() {
        if (this.relatedProducts != null) {
            for (var i = 0; i < this.relatedProducts.length; i++) {
                var rp = this.relatedProducts[i];
                if (rp._isFlavor() && !rp._isExtra() && rp.relatedProducts && rp.relatedProducts.length > 0) {
                    rp.parent._retrieveExtraFlavor(rp);
                    rp._retrieveHalfAndHalf();
                    return;
                }
            }
        }
    }

    _retrieveExtraFlavor(baseFlavorContainer, maxDepth = 2) {
        if (maxDepth && this.relatedProducts != null) {
            for (var i = 0; i < this.relatedProducts.length; i++) {
                var rp = this.relatedProducts[i];
                if (rp._isFlavor() && rp._isExtra()) {
                    this._linkExtraFlavor(baseFlavorContainer, rp);
                    return true;
                } else if (rp._retrieveExtraFlavor(baseFlavorContainer, maxDepth - 1)) {
                    break;
                }
            }
        }
    }

    _linkExtraFlavor(baseFlavorContainer, extraFlavorContainer, isRoot = true) {
        baseFlavorContainer.cloneContainerTarget = extraFlavorContainer;
        extraFlavorContainer.cloneContainerSource = baseFlavorContainer;
        if (extraFlavorContainer.relatedProducts == null) {
            logger.error('Nandos Middleware', 'extraFlavorContainer should have related products', extraFlavorContainer)
            return
        }

        baseFlavorContainer.relatedProducts.forEach(rp => {

            if (rp.relatedProducts == null || rp.relatedProducts.length == 0) {
                var match = extraFlavorContainer.relatedProducts.find(erp => {
                    return erp.name.toLowerCase() == rp.name.toLowerCase();
                });

                if (match != null) {
                    rp.cloneTargetProduct = match;
                    match.cloneSourceProduct = rp;
                }
            } else if (rp._isHalfAndHalf) {
                var match = extraFlavorContainer.relatedProducts.find(erp => {
                    return erp.relatedProducts != null && erp.relatedProducts.length > 0 && erp._isHalfAndHalf();
                });

                if (match != null) {
                    this._linkExtraFlavor(rp, match, false);
                }
            }

        });
    }

    _retrieveHalfAndHalf() {
        for (var i = 0; i < this.relatedProducts.length; i++) {
            var rp = this.relatedProducts[i];
            if (rp._isFlavor() && rp._isHalfAndHalf()) {
                rp._restructureHalfAndHalf();
            }
        }
    }

    _restructureHalfAndHalf() {
        if (this.relatedProducts == null) {
            logger.error('Nandos Middleware', 'This product should have related products', this)
            return
        }

        var categories = {};
        this.halfAndHalfContainer = true;
        this.description = "Choose your first flavour"; // Regionalisation risk 12
        for (var i = 0; i < this.relatedProducts.length; i++) {
            var rp = this.relatedProducts[i];
            var s = rp.name.split(" / ");


            if (!categories[s[0]]) {
                categories[s[0]] = [];
            }

            if (!categories[s[1]]) {
                categories[s[1]] = [];
            }

            rp.halfAndHalfName = rp.shortName;
            rp.name = s[1];
            rp.shortName = rp.name;
            categories[s[0]].push(rp);

            var rpClone = Object.assign(Object.create(Object.getPrototypeOf(rp)), rp);
            rpClone.name = s[0];
            rpClone.shortName = rpClone.name;
            rpClone.proxyTo = rp;
            categories[s[1]].push(rpClone);
        }

        this.relatedProducts = [];

        Object.keys(categories).forEach(k => {
            var catProd = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
            catProd.halfAndHalfContainer = false;
            catProd.parent = this;
            catProd.name = k + " /";
            catProd.shortName = catProd.name;
            catProd.description = "And now choose your second flavour"; // Regionalisation risk 12
            catProd.id += k;
            catProd.quantity = 1;
            catProd.virtual = true;
            catProd.relatedProducts = categories[k];
            catProd.relatedProducts.forEach(rp => {
                rp.parent = catProd;
            });
            this.relatedProducts.push(catProd);
            this.root.relatedProductsMap[catProd.id] = catProd;
        });
    }

    _isExtra() {
        return /(add|more|extra) /gi.test(this.name);
    }

    _isHalfAndHalf() {
        return /(half) /gi.test(this.name);
    }

    _isFlavor() {
        return !this.isRoot() &&
            this.productType != "COMBO_MAIN" &&
            this.productType != "MULTI_COMBO_MAIN" &&
            /sauce|flavor|flavour|flav/gi.test(this.name);
    }
}