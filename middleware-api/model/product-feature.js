import ImageData from './image-data'

export default class ProductFeature {

	constructor(data) {
		this.id = data.id
		this.name = data.name
		this.description = data.description
		this.icon = data.icon && new ImageData(data.icon).resize(40, 40)
	}

}