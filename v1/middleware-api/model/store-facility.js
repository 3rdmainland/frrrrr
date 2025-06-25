import ImageData from './image-data'

export default class StoreFacility {

    constructor(data = {}) {
        this.title = data.title
        this.type = data.type
        this.icon = data.icon && new ImageData(data.icon).resize(40, 40)
    }
}