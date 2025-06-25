import { ORDER_TYPES } from 'nandos-middleware-api/model/food-basket'

export default function (orderType) {
	switch(orderType) {
		case ORDER_TYPES.DELIVERY: return 'teal bright pattern-bg pattern-bg--flowery pattern-bg--scale-up'
		case ORDER_TYPES.COLLECTION: return 'green lighten-1 pattern-bg pattern-bg--flowery pattern-bg--scale-up'
		case ORDER_TYPES.EAT_IN: return 'yellow sunshine pattern-bg pattern-bg--eat-in'
	}
}