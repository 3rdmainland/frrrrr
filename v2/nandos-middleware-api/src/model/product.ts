import type ProductDefinition from './product-definition';
import type ImageCollection from './image-collection';
import type ProductFeature from './product-feature';
import type ProductState from './product-state';
import type { IAllergen } from '@nandos-types/model/menu';
import type { IBasketItem } from '@nandos-types/model/basket-item';
import type { IBehavior } from '@nandos-types/model/product';
import type { TWeightedNutritionalComponent } from './product-definition';
import {
    FLAVOUR_MAPPINGS, 
    FAMILY_TYPE_MAP,
    PRODUCT_TYPE,
    type TProductType,
    type IProduct, 
} from '@nandos-types/model/product';
import type { DisplayConfigGroup } from '../util/menu-pack-helper'
import { pickLabel } from '../util/menu-pack-helper'

export default class Product {

    public id: string;
    public parent: Product | null;
    public root: Product;
    public productType: TProductType | null;
    public price: number;
    public userRelevance: number;
    public userFlavourPreference: string | null;
    public quantity: number;
    public default: boolean;
    public mandatory: boolean;
    public hasMandatory: boolean;
    public definition: ProductDefinition;

    public definitionId?: string;
    public name?: string;
    public shortName?: string;
    public description?: string;
    public keywords?: Record<string, string>;
    public generalDisclaimer?: string;
    public deliveryDisclaimer?: string;
    public imageCollection?: ImageCollection;
    public badge?: any;
    public accentColor?: string;
    public features?: ProductFeature[];
    public searchBias?: number;
    public hasNutritionalInfo?: boolean;
    public nutritionalInfo?: TWeightedNutritionalComponent[];
    public hasAllergenInfo?: boolean;
    public allergens?: IAllergen[];
    public servingSize?: number;
    public upsells?: any;

    public idPath: string | undefined;

    public relatedProductsMap?: Record<string, Product>;
    public relatedProducts?: Product[];
    public comboMain?: Product;
    public cloneContainerSource?: Product;

    public proxyTo?: Product;
    public virtual?: boolean;
    public cloneTargetProduct?: Product;
    public cloneContainerTarget?: Product;
    public cloneSourceProduct?: Product; 
    public halfAndHalfName?: string;
    public halfAndHalfContainer?: boolean;

    constructor(
        data: IProduct, 
        parent: Product | null, 
        product_root: Product | null, 
        productDefinitionsMap: Record<string, ProductDefinition>
    ) {

        if (data.productDefinitionId == null) {
            console.error('Nandos Middleware', 'This product has no corresponding PRODUCT_DEFINITION', data);
        }

        this.parent = parent;
        this.root = product_root || this;
        this.root.relatedProductsMap = this.root.relatedProductsMap || {};

        this.id = data.id;
        this.productType = data.productType;

        if (this.productType == PRODUCT_TYPE.COMBO_MAIN && data.relatedProducts && data.relatedProducts.length > 1) {
            this.productType = PRODUCT_TYPE.MULTI_COMBO_MAIN;
        }

        if (this.productType == PRODUCT_TYPE.CONDIMENT && data.relatedProducts && data.relatedProducts.length > 0) {
            this.productType = null;
        }

        if (
            this.parent && 
            this.parent.productType == PRODUCT_TYPE.COMBO_MAIN && 
            this.productType == PRODUCT_TYPE.SIMPLE
        ) {
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
        this.idPath = this.isRoot() ? this.definitionId : this.id;

        if (data.relatedProducts) {
            this.relatedProducts = data.relatedProducts.map(p => new Product(p, this, this.root, productDefinitionsMap));
        }

        if (this.parent && this.mandatory) {
            this.parent.hasMandatory = true;
        }

        this.root.relatedProductsMap[this.id] = this;

        this._handleFlavors();
    }

    isAvailable(): boolean {
        return this.isLeaf()
            ? this.definition.isAvailable
            : (this.definition.isAvailable && this.relatedProducts?.some(rp => rp.isAvailable())) || false;
    }

    isHiddenByExclusion(): boolean {
        return this.isLeaf()
            ? this.definition.isHiddenByExclusion
            : this.definition.isHiddenByExclusion || this.relatedProducts?.every(rp => rp.isHiddenByExclusion()) || false; // if all children are hidden, mark the parent as hidden
    }

    getExclusions() {
        return this.definition.exclusions;
    }

    isHidden(state: ProductState) {
        if (this.cloneContainerSource) {
            let selectedChildren = this.relatedProducts
                ?.filter(r => r.isSelected(state))
                .length;
            if (selectedChildren == 0) return true;
        }

        return false;
    }

    isSelectable() {
        let result = this.isAvailable() && 
                    (this.productType == PRODUCT_TYPE.SIMPLE || this.productType == PRODUCT_TYPE.CONDIMENT) || 
                    (this.isLeaf() && this.productType != PRODUCT_TYPE.COMBO_MAIN);

        if (result && this.relatedProducts && (this.mandatory || this.hasMandatory)) {
            result = false;
        }

        return result;
    }

    isSelected(state: ProductState): boolean {
        if (this.proxyTo) {
            return false;
        } else if (this.virtual) {
            if (this.relatedProducts) {
                return !!this.relatedProducts.filter(rp => !rp.proxyTo).find(rp => state.isSelected(rp)) || false;
            }
        } else if (this.cloneContainerSource && this.parent && this.parent.cloneContainerSource) {
            if (this.relatedProducts) {
                return !!this.relatedProducts.find(rp => state.isSelected(rp)) || false;
            }
        }

        return state.isSelected(this) || this.isRoot() || this.productType === PRODUCT_TYPE.COMBO_MAIN || this.isAlwaysSelected(state);
    }

    setSelected(state: ProductState, value: boolean) {
        if (value) {
            this.select(state);
        } else {
            this.deselect(state);
        }
    }

    select(state: ProductState): void {

        if (this.proxyTo) {
            return this.proxyTo.select(state);
        }

        if (this.isHidden(state)) {
            return;
        }

        if (state.isSelected(this)) return;

        if (this.parent) {
            if (this.parent.quantity == 1) {
                this.parent.relatedProducts?.forEach(r => r.deselect(state));
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

    deselect(state: ProductState): void {

        if (this.proxyTo) {
            return this.proxyTo.deselect(state);
        }

        if (this.virtual) {
            if (this.isSelected(state)) return;
        } 
        else if (!state.isSelected(this) || !this.parent) return;

        const selectedSiblings = this.parent?.relatedProducts
            ?.filter(r => r.isSelected(state) && r.id != this.id)
            .length || 0;

        if (selectedSiblings == 0 && this.parent) {
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

    traverse(
        state: ProductState, 
        filter: (p: Product, s: ProductState) => boolean, 
        result: Product[] = []
    ) {
        if (!filter || filter(this, state)) {
            result.push(this);
            if (this.relatedProducts) {
                this.relatedProducts.forEach(rp => rp.traverse(state, filter, result));
            }
        }

        return result;
    }

    getSelectedProducts(state: ProductState) {
        return this.traverse(state, (p, s) => p.isSelected(s));
    }

    getConfigurationDescription(state: ProductState, fromId: string = "") {
        fromId = fromId || this.id;
        let descriptors: string[] = [];

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
                } else if (this.productType === PRODUCT_TYPE.SIMPLE) {
                    if (this.parent && this.parent.productType === PRODUCT_TYPE.COMBO_MAIN && descriptors.length > 0) {
                        descriptors = [`${descriptors.join(", ")}`];
                    } else {
                        let desc = this.shortName || "";
                        if (descriptors.length > 0) {
                            desc = `${desc} (${descriptors.join(", ")})`;
                        }
                        descriptors = [desc];
                    }
                } else if (this.productType === PRODUCT_TYPE.CONDIMENT) {
                    if (this.parent.cloneContainerSource) {
                        descriptors = [this.parent.shortName + ": " + this.shortName];
                    } else {
                        descriptors = [this.halfAndHalfName || this.shortName || ""];
                    }
                } else {
                    if (descriptors.length > 0) {
                        descriptors = [descriptors.join(", ")];
                    }
                }
            }
        }

        return (!this.parent || this.id == fromId) ? descriptors.join(" - ") : descriptors;
    }

    computePrice(state: ProductState): number {
        if (this.isSelected(state)) {
            return this.getSelectedProducts(state)
                .map(p => p.price)
                .reduce((sum, val) => sum + val, 0);
        } else {
            return this.price ? this.price : this.collapse().price;
        }
    }

    // Return all exclusions from products that are selected, but unavailable
    computeSelectedExclusions(state: ProductState) {
        return this.getSelectedProducts(state)
            .filter(p => !p.isAvailable()) // find only unavailable products
            .map(p => p.getExclusions())
            .reduce((prev, curr) => prev.concat(curr), []) // flatten
            .filter((item, idx, arr) => arr.indexOf(item) == idx) // dedupe
    }

    isAlwaysSelected(state: ProductState) {
        if (!this.parent) return false;
        return this.parent.isSelected(state) && this.mandatory == true && this.collapse().isLeaf();
    }

    isConfigured(state: ProductState) {
        return this.isValidState(state) && this.isSelected(state);
    }

    isValidState(state: ProductState) {
        return this.getInvalidProducts(state).length === 0;
    }

    getInvalidProducts(state: ProductState) {
        return this.traverse(state, (p, s) => p.requiresSelection() || p.isSelected(state)) // `p.isSelected(state)` is here to ensure the full selection chain is returned
            .filter(p => !p.isSelected(state) || !p.isAvailable())
    }

    requiresSelection() {
        return this.mandatory || this.isRoot() || this.productType === PRODUCT_TYPE.COMBO_MAIN || this.productType === PRODUCT_TYPE.MULTI_COMBO_MAIN
    }

    /**
     * Returns true when a multi-select node has had all its options chosen (all optional and mandatory nodes)
     */
    multiSelectIsConfigured(state: ProductState) {
        if (!this.relatedProducts) {
            return false;
        }

        const expectedQuantity = this.relatedProducts.length
        return expectedQuantity == this.relatedProducts
            .filter(p => p.isSelected(state))
            .length;
    }

    isRoot() {
        return this.parent == null;
    }

    getRelatedProduct(id: string) {
        if (this.root && this.root.relatedProductsMap) {
            return this.root.relatedProductsMap[id];
        }
        return undefined;
    }

    hasRelatedProducts() {
        if (!this.relatedProducts) return false;
        return this.relatedProducts.length >= 1;
    }

    getRelatedProducts(originalStructure = false) {
        let result = this.relatedProducts;
        if (originalStructure && this.halfAndHalfContainer && result) {
            result = result.filter(rp => rp.relatedProducts)
                            .reduce((a, rp) => a.concat(rp.relatedProducts as Product[]), [] as Product[])
                            .filter(rp => !rp.proxyTo);
        }

        return result;
    }

    isLeaf(): boolean {
        return !!this.cloneContainerSource || this.relatedProducts == null || !this.relatedProducts.length;
    }

    hasSubTrees(): boolean {
        if (!this.relatedProducts) return false;
        return this.relatedProducts.find(rp => !rp.isLeaf()) != null;
    }

    onlyHasLeaves(): boolean {
        if (!this.relatedProducts) return false;
        return this.relatedProducts.find(rp => !rp.isLeaf()) == null;
    }

    configureFromBasketItem(basketItem: IBasketItem, state: ProductState) {
        state.setSelected(this, true);

        if (basketItem.subItems) {
            basketItem.subItems.forEach(subItem => {
                const child = this.getRelatedProduct(subItem.productId);
                if (child) child.configureFromBasketItem(subItem, state);
            });
        }

        return state;
    }

    applyCustomerBehaviour(behaviour: IBehavior) {
        this.userRelevance = behaviour.score;

        if (this.relatedProducts && behaviour.subItems) {
            behaviour.subItems.forEach(subItem => {
                const child = this.relatedProducts?.find(rp => rp.definitionId == subItem.productDefinitionId);
                if (child) child.applyCustomerBehaviour(subItem);
            });
        }
    }

    collapse(): Product {
        if (this.relatedProducts && this.relatedProducts.length == 1) {
            return this.relatedProducts[0].collapse();
        }

        return this;
    }

    isFlavourContainer() {
        return this._isFlavor() && this.hasRelatedProducts() && !this._isExtra() && !this._isHalfAndHalf();
    }

    isSideConatiner() {
        return /(side)/gi.test(this.name || "") && !this.isLeaf();
    }

    /**
     * Returns only simple leaf products (products that can be added without additional configuration) that are available
     */
    canBeQuickPicked() {
        return this.isAvailable() && this.productType == PRODUCT_TYPE.SIMPLE && this.isLeaf();
    }

    /**
     * Returns relatedProducts (children) that can be quick picked at no additional cost
     */
    getQuickPickChildren(state: ProductState, maxItems = Number.POSITIVE_INFINITY) {
        return this.traverse(state, (p, s) => p.isAvailable() && p.price == 0)
            .filter(p => p.canBeQuickPicked())
            .slice(0, maxItems);
    }

    /**
     * Returns the family the product belongs to.
     * 'drink', 'side', 'flavour' or 'generic'
     */
    getProductFamily() {
        // We don't look up the parent chain for `flavour` because that causes trouble :/
        if (this.isFlavourContainer()) {
            return FAMILY_TYPE_MAP.FAMILY_TYPE_FLAVOUR;
        }

        let product: Product = this;

        while (product.parent) {
            if (product.name) {
                let name = product.name.toLowerCase();
                if (name.includes('drink')) return FAMILY_TYPE_MAP.FAMILY_TYPE_DRINK;
                else if (name.includes('side')) return FAMILY_TYPE_MAP.FAMILY_TYPE_SIDE;
            }
            product = product.parent;
        }

        return FAMILY_TYPE_MAP.FAMILY_TYPE_GENERIC;
    }

    getNormalisedFlavourCode() {
        const sanitized = (this.name || "")
            .toLowerCase()
            .replace(/\//g, '')
            .trim()
            .replace(/ /g, '-')
            .replace(/(\&|\+)/g, 'and')
            .replace(/plain$/g, 'no-sauce')
            .replace(/extra/g, 'xtra')

        let remapped = Object.entries(FLAVOUR_MAPPINGS)
            .find(([key, alternatives]) => sanitized == key || (alternatives && alternatives.includes(sanitized)))

        return remapped ? remapped[0] : sanitized;
    }

    generateSelectionIdentifier(state: ProductState) {
        return this.getSelectedProducts(state)
            .map(p => p.id)
            .sort()
            .toString();
    }

    private _handleFlavors() {
        if (this.relatedProducts != null) {
            for (let i = 0; i < this.relatedProducts.length; i++) {
                const rp = this.relatedProducts[i];
                if (rp._isFlavor() && !rp._isExtra() && rp.relatedProducts && rp.relatedProducts.length > 0) {
                    rp.parent && rp.parent._retrieveExtraFlavor(rp);
                    rp._retrieveHalfAndHalf();
                    return;
                }
            }
        }
    }

    private _retrieveExtraFlavor(baseFlavorContainer: Product, maxDepth = 2) {
        if (maxDepth && this.relatedProducts != null) {
            for (let i = 0; i < this.relatedProducts.length; i++) {
                const rp = this.relatedProducts[i];
                if (rp._isFlavor() && rp._isExtra()) {
                    this._linkExtraFlavor(baseFlavorContainer, rp);
                    return true;
                } else if (rp._retrieveExtraFlavor(baseFlavorContainer, maxDepth - 1)) {
                    break;
                }
            }
        }
        return false;
    }

    _linkExtraFlavor(baseFlavorContainer: Product, extraFlavorContainer: Product, isRoot = true) {
        baseFlavorContainer.cloneContainerTarget = extraFlavorContainer;
        extraFlavorContainer.cloneContainerSource = baseFlavorContainer;
        if (extraFlavorContainer.relatedProducts == null) {
            console.error('Nandos Middleware', 'extraFlavorContainer should have related products', extraFlavorContainer)
            return;
        }

        baseFlavorContainer.relatedProducts?.forEach(rp => {

            if (rp.relatedProducts == null || rp.relatedProducts.length == 0) {
                const match = extraFlavorContainer.relatedProducts?.find(erp => {
                    return erp.name?.toLowerCase() === rp.name?.toLowerCase();
                });

                if (match != null) {
                    rp.cloneTargetProduct = match;
                    match.cloneSourceProduct = rp;
                }
            } else if (rp._isHalfAndHalf()) {
                const match = extraFlavorContainer.relatedProducts?.find(erp => {
                    return erp.relatedProducts != null && erp.relatedProducts.length > 0 && erp._isHalfAndHalf();
                });

                if (match != null) {
                    this._linkExtraFlavor(rp, match, false);
                }
            }

        });
    }

    private _retrieveHalfAndHalf() {
        if (!this.relatedProducts) return;

        for (var i = 0; i < this.relatedProducts.length; i++) {
            var rp = this.relatedProducts[i];
            if (rp._isFlavor() && rp._isHalfAndHalf()) {
                rp._restructureHalfAndHalf();
            }
        }
    }

    private _restructureHalfAndHalf() {
        if (this.relatedProducts == null) {
            console.error('Nandos Middleware', 'This product should have related products', this)
            return;
        }

        const categories: Record<string, Product[]> = {};
        this.halfAndHalfContainer = true;
        this.description = "Choose your first flavour"; // Regionalisation risk 12
        for (let i = 0; i < this.relatedProducts.length; i++) {
            const rp = this.relatedProducts[i];

            if (!rp.name) continue;
            const s = rp.name.split(" / ");


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
            const catProd = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
            catProd.halfAndHalfContainer = false;
            catProd.parent = this;
            catProd.name = k + " /";
            catProd.shortName = catProd.name;
            catProd.description = "And now choose your second flavour"; // Regionalisation risk 12
            catProd.id += k;
            catProd.quantity = 1;
            catProd.virtual = true;
            catProd.relatedProducts = categories[k];
            catProd.relatedProducts.forEach((rp: Product) => {
                rp.parent = catProd;
            });
            this.relatedProducts?.push(catProd);

            if (this.root && this.root.relatedProductsMap) {
                this.root.relatedProductsMap[catProd.id] = catProd;
            }
        });
    }

    _isExtra() {
        if (!this.name) return false;
        return /(add|more|extra) /gi.test(this.name);
    }

    _isHalfAndHalf() {
        if (!this.name) return false;
        return /(half) /gi.test(this.name);
    }

    _isFlavor() {
        if (!this.name) return false;
        return !this.isRoot() &&
            this.productType != PRODUCT_TYPE.COMBO_MAIN &&
            this.productType != PRODUCT_TYPE.MULTI_COMBO_MAIN &&
            /sauce|flavor|flavour|flav/gi.test(this.name);
    }
    public getConfigUI(): DisplayConfigGroup[] {
        const groups = this.definition.configurationGroups || [];
        return groups.map(g => ({
            title: pickLabel(g.name),
            options: g.choices.map(c => ({
                label: pickLabel(c.name),
                subOptions: c.subChoices?.map(sc => ({ label: pickLabel(sc.name) }))
            }))
        }));
    }
}
