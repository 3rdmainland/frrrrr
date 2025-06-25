import MyOrderReviewService, { REVIEW_STATUS } from 'nandos-middleware-api/service/my-order-review-service'
import OrderTypeKey from 'nandos-i18n/src/filters/order-type-key'
import { Toggleable } from 'nandos-core-ui'

export default {

  mixins: [Toggleable],

  props: {
    order: { type: Object, required: true },
    canIgnore: { type: Boolean },
  },

  data() {
    return {
      reviewDeliveryScore: this.order.reviewDeliveryScore,
      reviewFoodScore: this.order.reviewFoodScore,
      reviewComment: this.order.reviewComment,
    }
  },

  computed: {
    canSubmit() {
      return this.reviewDeliveryScore !== null && this.reviewFoodScore !== null
    },

    orderTypeKey() {
      return OrderTypeKey(this.order)
    },
  },

  methods: {
    rateOrder() {
      this.isActive = false
      MyOrderReviewService.submitReview(this.order.id, REVIEW_STATUS.REVIEWED, this.reviewFoodScore, this.reviewDeliveryScore, this.reviewComment)
    },

    ignore() {
      this.isActive = false
      MyOrderReviewService.submitReview(this.order.id, REVIEW_STATUS.IGNORE)
    },
  }
}