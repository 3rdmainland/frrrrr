import ImageData from './image-data'

export default class GiftCardDesignPreset {

	constructor(data = {}) {
		this.image = data.image && new ImageData(data.image)
		this.theme = data.theme
	}
}