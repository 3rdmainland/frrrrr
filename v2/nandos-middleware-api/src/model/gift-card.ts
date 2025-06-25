import type { IGiftCard, TGiftCardStatus } from "@nandos-types/model/gift-card";

export default class GiftCard implements IGiftCard {
  id?: string;
  renderedImageUrl?: string;
  toName?: string;
  toMobilePhoneNumber?: string;
  toEmail?: string;
  issuedAmount?: number;
  status?: TGiftCardStatus;
  wiBalance?: number;
  wiCode?: string;
  wiId?: number;
  createdDate?: string | number;
  expiryDate?: string | number;

  constructor(data: Partial<IGiftCard> = {}) {
    this.id = data.id;
    this.renderedImageUrl = data.renderedImageUrl; // used to read the final card image
    this.toName = data.toName;
    this.toMobilePhoneNumber = data.toMobilePhoneNumber;
    this.toEmail = data.toEmail;
    
    // The following properties are only available after the card has been purchased
    this.issuedAmount = data.issuedAmount;
    this.status = data.status;
    this.wiBalance = data.wiBalance;
    this.wiCode = data.wiCode;
    this.wiId = data.wiId;
    this.createdDate = data.createdDate;
    this.expiryDate = data.expiryDate;
  }
}