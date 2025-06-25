export default class CustomerCreditCard {

	constructor(data = {}) {
		this.id = data.id
		this.cardHolderName = data.cardHolderName
    this.cardNumber = data.cardNumber
		this.expiryMonth = data.expiryMonth
		this.expiryYear = data.expiryYear
		this.cvv = data.cvv
    this.cardExpired = data.cardExpired
    this.tokenExpired = data.tokenExpired
	}

  get expired() {
    return this.cardExpired || this.tokenExpired
  }

  get type() {
    return detect(this.cardNumber)
  }
}

// Detect Card Type
// Based off of https://gist.githubusercontent.com/craigmaslowski/18b4fd730e6acc4aedc4/raw/c31aa73d27150392c7e46de3aeda73af04c85fe1/detect-card-type.js
var cardTypes = {
  'american-express': [
    [34],
    [37]
  ],
  'diners-club': [
    [300, 305], 
    [309], 
    [36], 
    [38, 39]
  ],
  'discover': [
    [6011],
    [622126, 622925],
    [644, 649],
    [65]
  ],
  'jcb': [
    [3528, 3589]
  ],
  'maestro': [
    [50],
    [56, 69],
  ],
  'mastercard': [
    [51, 55]
  ],
  'visa': [
    [4]
  ],
}

function between(cardNumber, x, y) {
  var cardNumberPrefix = cardNumber.substring(0, x.toString().length)
  if (isNaN(cardNumberPrefix)) return false
  return cardNumberPrefix >= x && cardNumberPrefix <= y
}

function detectCardType (cardNumber, prefixes) {
  for (var i = 0, n = prefixes.length; i < n; i++) {
    if (prefixes[i].length == 1) {
      if (cardNumber.startsWith(prefixes[i][0].toString()))
        return true
    } else if (prefixes[i].length == 2) {
      if (between(cardNumber, prefixes[i][0], prefixes[i][1])) {
        return true
      }
    }
  }
  
  return false
}

function detect (cardNumber) {
  if(!cardNumber) return null

  for (var property in cardTypes) {
    if (cardTypes.hasOwnProperty(property)) {
      if (detectCardType(cardNumber, cardTypes[property])) {
        return property
      }
    }
  }
}