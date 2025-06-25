import '../util/web-context-guard'
import ApiHttp from '../http';
import MeService from './customer/me-service';
import CustomerPastOrder from '../model/customer-past-order'

export const REVIEW_STATUS = {
	REVIEWED: 'REVIEWED',
	IGNORE: 'IGNORE',
}

class MyOrderReviewService {

	get customerId() {
    return MeService.customerId
  }

	getPendingReview() {
		return ApiHttp.get(`/customers/${this.customerId}/basket/review`)
			.then(response => response.data.basket ? new CustomerPastOrder(response.data.basket) : null)
	}

	submitReview(id ,reviewStatus, reviewFoodScore, reviewDeliveryScore, reviewComment) {
		return ApiHttp.put(`/customers/${this.customerId}/basket/review`, {id, reviewStatus, reviewFoodScore, reviewDeliveryScore, reviewComment})
			.then(response => new CustomerPastOrder(response.data.basket))
	}
}

export default new MyOrderReviewService();