import BasketService from "nandos-middleware-api/service/basket/my-basket-service";
import CustomerService from "nandos-middleware-api/service/customer/me-service";
import Tracker from "nandos-tracking";
import OrderTypeKey from "nandos-i18n/src/filters/order-type-key";
import { requestReview } from "../../app-rating";

export default {
  data() {
    return {
      basket: null,
      customer: null,
      paymentService: BasketService,
      checkoutInProgress: false,
      loading: false,
      isFinalStep: true,
      somePaymentMethodsAvailable: false,
      walletContribution: null,
      tipContribution: null,
      voucher_contributions: null,
      additional_payment_amount: null,
      driverTipAmount: null,
    };
  },

  computed: {
    ready() {
      return this.basket != null && this.customer != null;
    },

    show_footer() {
      return this.$breakpoints.smDown && !this.checkoutInProgress;
    },

    orderTypeKey() {
      return OrderTypeKey(this.basket);
    },
  },

  created() {
    Tracker.track("checkout", 3);

    Promise.all([BasketService.getBasket(), CustomerService.getMe()]).then(
      ([basket, customer]) => {
        this.basket = basket;
        this.customer = customer;
      }
    );
  },

  methods: {
    onProceedBtnClick() {
      this.$refs.paymentProcessor.$el.scrollIntoView(true);
      this.$refs.paymentProcessor.proceed();
    },

    onPayBtnClick() {
      if (
        this.$refs.paymentProcessor.checkoutInProgress == false &&
        this.loading == false
      ) {
        this.loading = true;
        // As a final sanity check, re-validate the basket's legitimacy
        BasketService.getBasket(true)
          .then((basket) => {
            if (basket.canCheckout) {
              this.$refs.paymentProcessor.pay();
            } else {
              // There is an issue with the basket
              this.$router.push({ name: "basket" });
            }
          })
          .finally(() => (this.loading = false));
      }
    },

    onPaymentCancelled(error) {
      this.$router.push({ name: "basket" });
    },

    onSuccessfulPayment(transaction) {
      BasketService.paymentCompleted(transaction); // let the service layer know the basket was paid for

      // Payment option tracking
      transaction.components.forEach((t) =>
        Tracker.track(
          "paymentOption",
          t.type,
          t.amount,
          transaction.components.length > 1
        )
      );

      // Purchase tracking
      Tracker.track(
        "purchase",
        transaction.orderId,
        this.basket,
        this.basket.storeName
      );

      let next = this.customer.anonymous
        ? `/guest/order/food/${transaction.orderId}`
        : `/me/history/food/${transaction.orderId}`;
      this.$router.push(next);

      requestReview();
    },
  },
};
