import MenuCategory from './menu-category';
import Product from './product';
import UserProduct from './user-product';
import ProductState from './product-state';
import Promotion from './promotion';
import SystemNotification from './system-notification';

type TMenuDisplayItem = Product | UserProduct | MenuCategory | Promotion | SystemNotification; 

/**
 * A wrapper class that will contain either a `UserProduct`, a `MenuCategory` or a 'Promotion'
 */
export default class MenuDisplayItem {

	private _parent: any | null;
	private _category: MenuCategory | null;
	private _promotion: Promotion | null;
	private _systemNotification: any | null;
	private _product: UserProduct | null;
	private _autoconfigProduct: any | null;
	private _lazyChildren: any | null;
	private _children: MenuDisplayItem[] | null;

	constructor(item: TMenuDisplayItem, autoconfigured = false, parent: MenuDisplayItem | null = null) {
		this._parent = parent;
		this._category = null;
		this._promotion = null;
		this._systemNotification = null;
		this._product = null;
		this._autoconfigProduct = null;
		this._lazyChildren = null;
		this._children = null;

		if (item instanceof Product) {
			this._product = new UserProduct(item, new ProductState());
		}
		else if (item instanceof UserProduct) {
			if (autoconfigured) {
				this._product = new UserProduct(item.product, new ProductState());
				this._autoconfigProduct = item;
			} else {
				this._product = item;
			}
		}
		else if (item instanceof MenuCategory) {
			this._category = item;
			this._lazyChildren = Object.values(item.children);			
		}
		else if (item instanceof Promotion) {
			if (item instanceof SystemNotification) {
				this._systemNotification = item;
			}
			else this._promotion = item;
		}
	}

	get product() {
		return this._product;
	}

	get category() {
		return this._category;
	}

	get promotion() {
		return this._promotion;
	}

	get systemNotification() {
		return this._systemNotification;
	}

	get parent() {
		return this._parent;
	}

	get autoconfigProduct() {
		return this._autoconfigProduct;
	}

	get isEmpty() {
		return !this.isPromotion && !this.isProduct && (this.children == null || this.children.length == 0);
	}

	get children() {
		if (this._lazyChildren) {
			this._children = this._lazyChildren
				.filter((c: any) => c instanceof UserProduct == false || c.isHiddenByExclusion() == false) // filter out products that as isHiddenByExclusion
				.map((c: TMenuDisplayItem) => new MenuDisplayItem(c, false, this))
				.filter((c: MenuDisplayItem) => !c.isEmpty);
			this._lazyChildren = null;
		}
		return this._children;
	}

	get isProduct() {
		return this._product != null;
	}

	get isCategory() {
		return this._category != null;
	}

	get isPromotion() {
		return this._promotion != null;
	}

	get isSystemNotification() {
		return this._promotion != null;
	}

	get isAutoconfigured() {
		return this._autoconfigProduct != null;
	}

	get idPath() {
		if (this.isCategory) return this._category!.idPath;
		else if (this.isProduct) return this._product!.getIdPath();
		else if (this.isPromotion) return this._promotion!.id;
	}

	get id() {
		if (this.isCategory) return this._category!.id;
		else if (this.isProduct) return this._product!.getId();
		else if (this.isPromotion) return this._promotion!.id;
	}

	get displayType() {
		return this.isCategory ? this._category!.displayType : null
	}

	get name() {
		if (this.isCategory) return this._category!.name;
		else if (this.isProduct) return this._product!.getName();
		else if (this.isPromotion) return this._promotion!.name;
	}

	get description() {
		if (this.isCategory) return this._category!.description;
		else if (this.isProduct) return this._product!.getDescription();
		else if (this.isPromotion) return this._promotion!.description;
	}

	get features() {
		if (this.isCategory) return this._category!.features;
		else if (this.isProduct) return this._product!.getFeatures();
		else if (this.isPromotion) return [];
	}

	get price() {
		return this.isProduct ? this._product!.computePrice() : null
	}

	get minPrice() {
		return this.isCategory ? this._category!.minPrice : null
	}

	get autoconfigPrice() {
		return this.isAutoconfigured ? this._autoconfigProduct.computePrice() : null
	}

	get autoconfigDescription() {
		return this.isAutoconfigured ? this._autoconfigProduct.getConfigurationDescription() : null
	}

	get available(): boolean {
		if (this.isCategory) {
			const children = this.children;
			if (children) return children.some((child: MenuDisplayItem) => child.available);
		}
		else if (this.isProduct) return this._product!.isAvailable()
		else if (this.isPromotion) return true;
		return false;
	}

	get exclusions() {
		return this.isProduct ? this._product!.getExclusions() : null;
	}

	get path() {
		// @ts-ignore - There's no path in menu category, Did not find a path propery and type in the back-end
		return this.isCategory ? this._category.path : null;
	}

	get quickPickableProducts() {
		return this.isCategory ? this._category!.getQuickPickableProducts().map(p => new MenuDisplayItem(p)) : null;
	}

	get imageCollection() {
		if (this.isCategory) return this._category!.imageCollection;
		else if (this.isProduct) return this._product!.getImageCollection();
		else if (this.isPromotion) return this._promotion!.imageCollection;
	}

	get isFeatured() {
		return this.isCategory && this._category!.featured;
	}

	get badge() {
		// @ts-ignore - There's no badge in menu category, Did not find a path propery and type in the back-end
		if (this.isCategory) return this._category.badge
		else if (this.isProduct) return this._product!.getBadge()
		else if (this.isPromotion) return null;
	}

	get accentColor() {
		if (this.isCategory) return this._category!.accentColor;
		else if (this.isProduct) return this._product!.getAccentColor();
		else if (this.isPromotion) return this._promotion!.accentColor;
	}

	get suppressChildAccentColors() {
		if (this.isCategory) return this._category!.suppressChildAccentColors;
		else return false;
	}
}