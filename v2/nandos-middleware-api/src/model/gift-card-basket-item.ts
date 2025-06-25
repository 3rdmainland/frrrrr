import GiftCard from './gift-card';
import { type IGiftCardBasketItem } from '@nandos-types/model/gift-card-basket-item';

export default class GiftCardBasketItem {

  public id: string;
  public fromName: string;
  public price: number;
  public message: string;
  public scheduled: number;
  public srcImageUrl: string;
  public renderedImageUrl: string;
  public renderedImageData: string[];
  public cards: GiftCard[];

  constructor(data: IGiftCardBasketItem = {
    id: '',
    fromName: '',
    price: 0,
    message: '',
    scheduled: 0,
    srcImageUrl: '',
    renderedImageUrl: '',
    renderedImageData: [],
    cards: []
  }) {
  	this.id = data.id;
  	this.fromName = data.fromName;
  	this.price = data.price;
    this.message = data.message;
  	this.scheduled = data.scheduled;
    this.srcImageUrl = data.srcImageUrl; // the preset card design the user chose
  	this.renderedImageData = data.renderedImageData; // used to save base64 encoded image
  	this.renderedImageUrl = data.renderedImageUrl; // used to read the final card image

    /**
     * a `GiftCardBasketItem` can contain multiple gift cards (for multiple recipients)
     * `cards` is list of one or more gift cards, that contain info about each card's intended recipient
     **/
    this.cards = (data.cards && data.cards.map(card => new GiftCard(card))) || [];
  }

  get quantity() {
  	return this.cards.length;
  }
}