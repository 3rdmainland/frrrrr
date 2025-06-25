import { PRODUCT_TYPE } from '@nandos-types/model/product';
import type Product from './product';
import type ProductState from './product-state';
import type { IBasketItem } from '@nandos-types/model/basket-item';
import type { DisplayConfigGroup } from '../util/menu-pack-helper'

export default class UserProduct {

	public product: Product;
	private state: ProductState;

	constructor(product: Product, state: ProductState) {
		this.product = product;
		this.state = state;
		this.applyUserFlavourPreference()
	}

	getId() {
		return this.product.id;
	}

	getDefinitionId() {
		return this.product.definitionId;
	}

	getIdPath() {
		return this.product.idPath;
	}

	getName() {
		return this.product.name;
	}

	getShortName() {
		return this.product.shortName;
	}

	getParent() {
		const parentProduct = this.product.parent;
		return (parentProduct) ? new UserProduct(parentProduct, this.state) : parentProduct;
	}

  getProductType() {
    return this.product.productType;
  }

	isRoot() {
		return this.product.isRoot()
	}

	getRoot() {
		return new UserProduct(this.product.root, this.state);
	}

	isHidden() {
		return this.product.isHidden(this.state);
	}

	isAvailable() {
		return this.product.isAvailable();
	}

	isHiddenByExclusion() {
		return this.product.isHiddenByExclusion();
	}

	getExclusions() {
		return this.product.getExclusions();
	}

	isSelectable() {
		return this.product.isSelectable();
	}

	isSelected() {
		return this.product.isSelected(this.state);
	}

	setSelected(value: boolean) {
		this.product.setSelected(this.state, value);
	}

	getDescription() {
		return this.product.description;
	}

	getConfigurationDescription() {
		return this.product.getConfigurationDescription(this.state);
	}

	getFeatures() {
		return this.product.features;
	}

	computePrice() {
		return this.product.computePrice(this.state);
	}

	computeSelectedExclusions() {
		return this.product.computeSelectedExclusions(this.state);
	}

	isConfigured() {
		return this.product.isConfigured(this.state);
	}

	isAlwaysSelected() {
		return this.product.isAlwaysSelected(this.state);
	}

	isValidState() {
		return this.product.isValidState(this.state);
	}

	canMultiSelect() {
		return this.product.quantity > 1;
	}

	multiSelectIsConfigured() {
		return this.product.multiSelectIsConfigured(this.state);
	}

	requiresSelection() {
		return this.product.requiresSelection();
	}

	hasRelatedProducts() {
		return this.product.hasRelatedProducts();
	}

	getAllergens() {
		return this.product.allergens;
	}

	hasNutritionalInfo() {
		return this.product.hasNutritionalInfo;
	}

	hasAllergenInfo() {
		return this.product.hasAllergenInfo;
	}

	getNutritionalInfo() {
		return this.product.nutritionalInfo;
	}

	getServingSize() {
		return this.product.servingSize;
	}

	getGeneralDisclaimer() {
		return this.product.generalDisclaimer;
	}

	getDeliveryDisclaimer() {
		return this.product.deliveryDisclaimer;
	}

	getImageCollection() {
		return this.product.imageCollection
	}

	getBadge() {
		return this.product.badge;
	}

	getAccentColor() {
		return this.product.accentColor;
	}

	isHalfAndHalfContainer() {
		return this.product.halfAndHalfContainer || false
	}

	isLeaf() {
		return this.product.isLeaf();
	}

	hasSubTrees(){
		return this.product.hasSubTrees();
	}


	isMandatory() {
		return this.product.mandatory;
	}

	onlyHasLeaves() {
		return this.product.onlyHasLeaves();
	}

	getRelatedProduct(id: string) {
		const result = this.product.getRelatedProduct(id);
		return (result) ? new UserProduct(result, this.state) : result;
	}

	getRelatedProducts(originalStructure=false) {
		const result = this.product.getRelatedProducts(originalStructure);
		return (result) ? result.map(r => new UserProduct(r, this.state)) : result;
	}

	getSelectedProducts() {
		return this.product.getSelectedProducts(this.state)
			.map(p => new UserProduct(p, this.state))
	}

	/**
	 * Returns a related products array where the "COMBO_MAIN" choices are merged into the top level choices.
	 * Related products that are always selected/immutable are also filtered out
	 * Products that are unavailable because of the `HIDDEN` product exclusion rule are also filtered out
	 */
	getDisplayRelatedProducts() {

		let result = this.getRelatedProducts();

		if (!result) return result;

		result = result.filter(r => !r.isAlwaysSelected() && !r.isHidden()); // We don't display products that are immutable
		result = result.filter(r => !r.isHiddenByExclusion()); // We don't display products that are hidden by the `HIDDEN` exclusion rule
		const main = result.find(r => r.product.productType == PRODUCT_TYPE.COMBO_MAIN);

		if(main) {
			const collapsedMain = main.collapse()
			// If collapsed main contains related products that are NOT leaf nodes, merge those related products into the result
			if (collapsedMain.hasRelatedProducts() ) {
				result = result.filter(r => r.product.productType != PRODUCT_TYPE.COMBO_MAIN);

				let allRelatedProductsAreLeaves = true;

				collapsedMain.getRelatedProducts()?.forEach(rp => {
					if(!rp.isLeaf()) allRelatedProductsAreLeaves = false
				});

				if (allRelatedProductsAreLeaves) {
					result.unshift(collapsedMain)
				} else {
					result.unshift(...collapsedMain.getRelatedProducts() || [])
				}
			}
		}

		// result = result.sort((a,b)=>(a.getQuickPickChildren().length) - b.getQuickPickChildren().length) // sort the display so that quick pick items are at the bottom.

		return result;
	}

	getInvalidProducts() {
		return this.product.getInvalidProducts(this.state)
			.map(p => new UserProduct(p, this.state));
	}

	collapse() {
		return new UserProduct(this.product.collapse(), this.state);
	}

	isFlavourContainer() {
		return this.product.isFlavourContainer()
	}

	isSideConatiner() {
		return this.product.isSideConatiner()
	}

	canBeQuickPicked() {
		return this.product.canBeQuickPicked()
	}

	getQuickPickChildren(maxItems: number) {
		return this.product.getQuickPickChildren(this.state, maxItems)
			.map(p => new UserProduct(p, this.state))
	}

	getProductFamily() {
		return this.product.getProductFamily()
	}

	getNormalisedFlavourCode() {
		return this.product.getNormalisedFlavourCode()
	}

	configureFromBasketItem(basketItem: IBasketItem) {
		this.state.reset();
		this.state.orderQuantity = basketItem.quantity;
		this.product.configureFromBasketItem(basketItem, this.state);
	}

	generateSelectionIdentifier() {
		return this.product.generateSelectionIdentifier(this.state)
	}

	/**
	 * Applies the user's preferred flavour to the 1st top-level flavour container found (if any)
	 * If the flavour container already contains a selection, the user's preference is ignored
	 */
	applyUserFlavourPreference(forceSet = false) {
		if(this.product.userFlavourPreference != null || forceSet == true) {

			let flavourContainer = null;
			const displayRelatedProducts = this.getDisplayRelatedProducts();
			if (this.hasRelatedProducts() && displayRelatedProducts) {
				flavourContainer = displayRelatedProducts.find(p => p.isFlavourContainer());
			}

			// Don't override flavour selection if there is already a flavour selected, unless `forceSet` is true
			if(flavourContainer != null && (flavourContainer.isSelected() == false || forceSet)) {
				if(forceSet && this.product.userFlavourPreference == null) {
					flavourContainer.setSelected(false) // clear flavour selection
				}
				else {
					const flavourMatch = flavourContainer.getDisplayRelatedProducts()?.find(flavour => flavour.getDefinitionId() == this.product.userFlavourPreference);
					flavourMatch && flavourMatch.setSelected(true); // select matching flavour
				}
			}
		}
	}

	get orderQuantity() {
		return this.state.orderQuantity;
	}

	set orderQuantity(val: number) {
		if(val < 1) val = 1;
		this.state.orderQuantity = val;
	}

	public getConfigUI(): DisplayConfigGroup[] {
		return this.product.getConfigUI();
	}
}
