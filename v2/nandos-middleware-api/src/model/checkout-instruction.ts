import ImageCollection from './image-collection'
import { type ICheckoutInstruction } from '@nandos-types/model/order';

export default class CheckoutInstruction {

  public id: string;
  public name: string;
  public description: string;
  public disclaimer: string | undefined;
  public defaultSelected: boolean;
  public imageCollection: ImageCollection;
  public displayOrder: number | undefined;
  public selected: boolean;
  
  constructor(data: ICheckoutInstruction) {
    this.id = data.id
    this.name = data.name
    this.description = data.description;

    if (data.disclaimer !== '') {
      this.disclaimer = data.disclaimer;
    }

    this.defaultSelected = !!data.defaultSelected
    this.imageCollection = new ImageCollection(data.images)
    this.selected = this.defaultSelected // "selected" is used by frontend
  }

}