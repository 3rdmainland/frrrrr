import ApiHttp from '../http'
import CustomerPastOrder from '../model/customer-past-order'

class PublicOrderTrackingService {

	getOrder(token) {
		return ApiHttp.get(`/public/basket?id=${token}`)
			.then(response => new CustomerPastOrder(response.data.basket))
	}

	updateKerbsideState(token, status, coordinates) {
	  return ApiHttp.put(`/public/basket/kerbside`, { basketId: token, status/*, coordinates*/})
	    .then(response => response.data)
	}
}

export default new PublicOrderTrackingService()