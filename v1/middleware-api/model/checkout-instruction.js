import ImageCollection from './image-collection'

export default class CheckoutInstruction {

  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.disclaimer = data.disclaimer != '' && data.disclaimer
    this.defaultSelected = !!data.defaultSelected
    this.imageCollection = new ImageCollection(data.images)
    this.displayOrder = this.displayOrder
    this.selected = this.defaultSelected // "selected" is used by frontend
  }

}