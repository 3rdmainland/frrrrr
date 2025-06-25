import { type IProductFeature } from '@nandos-types/model/product-feature';
import ImageData from './image-data';

export default class ProductFeature {

	public id: string;
	public name: string;
	public description: string;
	public icon: ImageData;

	constructor(data: IProductFeature) {
		this.id = data.id;
		this.name = data.name;
		this.description = data.description;
		this.icon = data.icon && new ImageData(data.icon).resize(40, 40);
	}
}