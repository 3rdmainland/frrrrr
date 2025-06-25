import { 
  CARD_TYPES, 
  type ICustomerCreditCard
} from "@nandos-types/model/card";

export default class CustomerCreditCard {

  public id: string;
  public cardNumber: string;
  public expiryMonth: number;
  public expiryYear: number;
  public cardExpired: boolean;
  public tokenExpired: boolean;
  private _type: string | null = null;

	constructor(data: ICustomerCreditCard = {
    id: "",
    cardNumber: "",
    expiryMonth: 0,
    expiryYear: 0,
    cardExpired: false,
    tokenExpired: false
  }) {
		this.id = data.id
    this.cardNumber = data.cardNumber
		this.expiryMonth = data.expiryMonth
		this.expiryYear = data.expiryYear
    this.cardExpired = data.cardExpired
    this.tokenExpired = data.tokenExpired
    this._type = detect(this.cardNumber);
	}

  get expired() {
    return this.cardExpired || this.tokenExpired;
  }

  get type() {
    return this._type;
  }
}

function between(cardNumber: string, x: number, y: number) {
  const cardNumberPrefix = +cardNumber.substring(0, x.toString().length);
  if (isNaN(cardNumberPrefix)) return false;
  return cardNumberPrefix >= x && cardNumberPrefix <= y;
}

function detectCardType (cardNumber: string, prefixes: (number[])[]) {
  for (let i = 0, n = prefixes.length; i < n; i++) {
    if (prefixes[i].length == 1) {
      if (cardNumber.startsWith(prefixes[i][0].toString()))
        return true;
    } else if (prefixes[i].length == 2) {
      if (between(cardNumber, prefixes[i][0], prefixes[i][1])) {
        return true;
      }
    }
  }
  
  return false;
}

function detect(cardNumber: string) {
  if(!cardNumber) return null;

  for (const property in CARD_TYPES) {
    if (CARD_TYPES.hasOwnProperty(property)) {
      if (detectCardType(cardNumber, CARD_TYPES[property])) {
        return property;
      }
    }
  }

  return null;
}