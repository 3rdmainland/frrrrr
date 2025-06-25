import logger from "nandos-dev-logger";
import Vue from "vue";
import CustomerService from "nandos-middleware-api/service/customer/me-service";
import CustomerCreditCard from "nandos-middleware-api/model/customer-credit-card";
import CardTransaction from "nandos-middleware-api/model/card-transaction";
import { ORDER_TYPES } from "nandos-middleware-api/model/food-basket";
import NandosI18n from "nandos-i18n";
import Tracker from "nandos-tracking";
import { Browser } from '@capacitor/browser';

const CREDIT_CARD = "CREDIT_CARD";
const CASH = "CASH";
const WALLET = "WALLET";
const VOUCHER = "VOUCHER";

import InFlightTransactionPoller from "@/in-flight-transaction-poller";

/**
 * Keep the reference to the window we will open for payment outside of Vue's reactivity system,
 * otherwise reading it later causes an error to be raised: Uncaught DOMException: Blocked a frame with
 * origin "https://example.com" from accessing a cross-origin frame
 */
var webflowFormPostTarget = null;

/**
 * @component
 * This component handles payment related tasks, such as choosing/creating a new credit card,
 * paying with the selected credit card and managing any required bank web flows via an iframe.
 */
export default {
  props: {
    /**
     * The payment service that will be used to start the transaction on the middleware.
     * The service should implement the following methods: `doWalletPayment`, `doCardPayment`
     * and optionally implement a `doCashPayment` method
     *
     * Each payment method should return a `Promise` that resolves to a `CardTransaction`
     * The resolved `CardTransaction` will be inspected by the `payment-processor` and it will
     * determine if we need to display an additional web flow, or if the payment has been
     * successfully completed at this point.
     */
    paymentService: { type: Object, required: true },
    requiredPaymentAmount: { type: Number, required: true },
    orderType: { type: String, required: false },
    giftBasket: false,
  },

  data() {
    return {
      CASH,
      CREDIT_CARD,
      paymentOptions: null,
      cards: null,
      selectedCard: null,
      newCreditCard: new CustomerCreditCard(),
      paymentTypes: [],
      selectedPaymentType: null,
      selectedUnpaidOrderPaymentIntent: null,
      storeCard: false,
      useWallet: true,
      walletContribution: 0,
      vouchers: [],
      voucher_form: {
        code: null,
        loading: false,
        removeVoucher: null,
        error: null,
        is_valid: false,
      },
      isFinalStep: true,
      transaction: null,
      webFlowIframeLoaded: false,
      webflowFormPostTargetName: null,
      checkoutInProgress: false,
      paymentError: null,
      forceShowIframeTimer: null,
      renderIframeAndForm: false,
      driverTip: "0",
      driverTipAmount: 0,
      customTips: false,
    };
  },

  computed: {
    ready() {
      return this.paymentOptions != null;
    },

    requiredPaymentAmountIncTips() {
      return this.requiredPaymentAmount + this.driverTipAmount;
    },

    // True when paying with a new credit card, that will be captured by us (not payment gateway iframe)
    isMultiStep() {
      return (
        this.needs_additional_payment &&
        this.selectedPaymentType == CREDIT_CARD &&
        this.selectedCardIsNew &&
        !this.web_flow_credit_card_capture
      );
    },

    targetIsWindowOrRedirect() {
      return ["WINDOW", "REDIRECT"].includes(this.webFlowTargetType);
    },

    selectedCardIsNew() {
      return this.selectedCard == this.newCreditCard;
    },

    onlinePaymentsAvailable() {
      // credit card and/or wallet
      return this.paymentOptions.enabled;
    },

    tipsAvailable() {
      if (!this.giftBasket) {
        return this.paymentOptions.driverTipsAvailable;
      }
    },

    cashPaymentsAvailable() {
      return this.paymentOptions.allowUnpaidOrders;
    },

    voucherPaymentsAvailable() {
      return this.paymentOptions.voucherPaymentAvailable;
    },

    walletPaymentsAvailable() {
      return (
        this.ready &&
        this.paymentOptions.walletPaymentAvailable &&
        this.walletBalance > 0
      );
    },

    walletBalance() {
      return this.paymentOptions.walletState.balance;
    },

    maxWalletAmount() {
      return this.walletPaymentsAvailable
        ? Math.max(
            Math.min(
              this.requiredPaymentAmountIncTips - this.voucher_contributions,
              this.walletBalance
            ),
            0
          )
        : 0;
    },

    voucher_contributions() {
      return this.vouchers
        .map((voucher) => voucher.amount)
        .reduce((acc, next) => (acc += next), 0);
    },

    additional_payment_amount() {
      return Math.max(
        this.requiredPaymentAmount -
          this.walletContribution -
          this.voucher_contributions +
          this.driverTipAmount,
        0
      );
    },

    needs_additional_payment() {
      return this.additional_payment_amount > 0;
    },

    web_flow_credit_card_capture() {
      return this.paymentOptions.webFlowCreditCardCapture;
    },

    saved_card_requires_cvv() {
      return this.paymentOptions.provideCvvWithSavedCard;
    },

    show_payment_options() {
      return !this.checkoutInProgress && !this.paymentError;
    },

    show_web_flow_iframe() {
      return this.checkoutInProgress && this.webFlowIframeLoaded;
    },

    has_saved_cards() {
      return this.cards && this.cards.length > 0;
    },

    some_payment_methods_available() {
      return (
        this.ready &&
        (this.onlinePaymentsAvailable || this.cashPaymentsAvailable)
      );
    },

    webFlowTargetType() {
      return (
        this.transaction &&
        this.transaction.webFlow &&
        this.transaction.webFlow.target
      );
    },

    // When true, user will have to manually click a button to open the payment window pop-up (makes sure it doesn't get blocked by pop-up blockers)
    userClickRequiredToStartWebflow() {
      return this.$isBrowserApp && this.targetIsWindowOrRedirect;
    },

    orderTypeKey() {
      switch (this.orderType) {
        case ORDER_TYPES.DELIVERY:
          return "delivery";
        case ORDER_TYPES.COLLECTION:
          return "collection";
        case ORDER_TYPES.EAT_IN:
          return "eatIn";
      }
    },

    driverTipAmountFloat: {
      get() {
        return (this.driverTipAmount ?? 0) / 100;
      },
      set(v) {
        return (this.driverTipAmount = !v ? 0 : parseFloat(v).toFixed(2) * 100);
      },
    },
  },
  watch: {
    useWallet() {
      this.walletContribution = this.useWallet ? this.maxWalletAmount : 0;
    },

    maxWalletAmount() {
      this.walletContribution = this.useWallet ? this.maxWalletAmount : 0;
    },

    walletContribution() {
      this.$emit("wallet-contribution", this.walletContribution);
    },

    voucher_contributions() {
      this.$emit("voucher-contributions", this.voucher_contributions);
    },

    additional_payment_amount: {
      immediate: true,
      handler() {
        this.$emit("additional-payment-amount", this.additional_payment_amount);
      },
    },

    checkoutInProgress() {
      this.$emit("checkout-state-change", {
        inProgress: this.checkoutInProgress,
      });
    },

    paymentError() {
      this.$emit("payment-error-state-change", this.paymentError);
    },

    isMultiStep: {
      immediate: true,
      handler() {
        this.isFinalStep = !this.isMultiStep;
      },
    },

    isFinalStep: {
      immediate: true,
      handler() {
        this.$emit("is-final-step", this.isFinalStep);
      },
    },

    some_payment_methods_available: {
      immediate: true,
      handler() {
        this.$emit(
          "some-payment-methods-available",
          this.some_payment_methods_available
        );
      },
    },
    driverTip: {
      handler() {
        switch (this.driverTip) {
          case "0":
            this.driverTipAmount = 0;
            break;
          case "10":
            this.driverTipAmount = 1000;
            break;
          case "20":
            this.driverTipAmount = 2000;
            break;
          case "30":
            this.driverTipAmount = 3000;
            break;
          case "40":
            this.driverTipAmount = 4000;
            break;
          case "custom":
            this.driverTipAmount = 0;
        }
      },
    },
    driverTipAmount() {
      this.$emit("tip-contribution", this.driverTipAmount);
    },
  },
  created() {
    this.paymentService
      .getPaymentOptions()
      .then((options) => (this.paymentOptions = options))
      .then((_) => {
        if (this.cashPaymentsAvailable) this.paymentTypes.push(CASH);
        if (this.onlinePaymentsAvailable) this.paymentTypes.push(CREDIT_CARD);

        if (this.walletPaymentsAvailable)
          this.walletContribution = this.maxWalletAmount;

        // If wallet/vouchers don't cover the bill, and there is only 1 payment option, select that option
        if (this.needs_additional_payment && this.paymentTypes.length == 1)
          this.selectedPaymentType = this.paymentTypes[0];

        CustomerService.getCreditCards().then((cards) => {
          this.cards = cards.filter((card) => !card.expired);
          if (!this.has_saved_cards) this.selectedCard = this.newCreditCard;
        });
      });
  },

  methods: {
    proceed() {
      this.isFinalStep = true;
    },

    canPay() {
      return this.$refs.paymentForm.$el.checkValidity();
    },

    /**
     * @public
     * Starts the payment process (if form is valid)
     */
    async pay() {
      // Submit the payment form - if the form is valid, it will call _startPayment
      await this._applyDriverTip();
      this.$refs.paymentForm.submit();
    },

    /**
     * @private
     * Start the checkout process by validating the card payment via our middleware.
     * This might result in the transaction immediately completing or we might need to go through a
     * client-side web flow to finalise the transaction.
     */
    _startPayment() {
      if (this.checkoutInProgress) return;

      this.checkoutInProgress = true;
      this.paymentError = null;

      // New credit card tracking
      if (this.selectedPaymentType == CREDIT_CARD && this.selectedCardIsNew)
        Tracker.track("addPaymentInfo");

      // Call the appropriate payment method on the `paymentService` to start the transaction
      this._callServicePaymentMethod(this.selectedCard)
        .then((transaction) => {
          this.transaction = transaction;

          if (transaction.success) {
            if (transaction.completed) {
              // No further action (web flow) required. The transaction has now been successfully completed
              this._handleSuccessfulPayment(transaction);
            } else if (transaction.webFlow) {
              if (this.userClickRequiredToStartWebflow == false)
                this._startWebFlow();
            }
          } else {
            this._handlePaymentError(null, transaction);
          }
        })
        .catch((error) => this._handlePaymentError(error));
    },

    /**
     * Calls the appropriate payment function on the`paymentService` and returns the resulting promise
     */
    _callServicePaymentMethod(card = null) {
      if (!this.needs_additional_payment) {
        // no card or cash payment required (wallet and/or vouchers cover the bill)
        return this.paymentService.doWalletPayment.bind(this.paymentService)(
          this.walletContribution,
          this.driverTipAmount
        );
      } else if (this.selectedPaymentType == CREDIT_CARD) {
        return this.paymentService.doCardPayment.bind(this.paymentService)(
          this.walletContribution,
          this.driverTipAmount,
          card,
          this.storeCard
        );
      } else if (this.selectedPaymentType == CASH) {
        return this.paymentService.doCashPayment.bind(this.paymentService)(
          this.walletContribution,
          this.driverTipAmount,
          this.selectedUnpaidOrderPaymentIntent
        );
      }
    },

    _generateWebFlowFormPageForCordova(transaction) {
      let pageContent = `
      <html><head></head><body>
        <form action="${transaction.webFlow.action}" id="paymentForm" method="${
        transaction.webFlow.method
      }">
          ${Object.entries(transaction.webFlow.parameters)
            .map(
              ([name, value]) =>
                `<input type="hidden" name="${name}" value="${value}" />`
            )
            .join("")}
        </form>
      <script type="text/javascript">document.getElementById("paymentForm").submit();</script></body></html>`; // Initiate the web flow by submitting the form

      return "data:text/html;base64," + btoa(pageContent);
    },

    /**
     * Allows us to recreate <form> and <iframe> elements to bypass a bug in cordova app
     * when paying via webflow, and using 3dSecure for a second time (1st 3d attempt secure results in a cancellation/failure)
     */
    _reRenderFormAndIframe() {
      return new Promise((resolve, reject) => {
        this.renderIframeAndForm = false;
        this.$nextTick(() => {
          this.renderIframeAndForm = true;
          this.$nextTick(resolve);
        });
      });
    },

    _setupListeners(webflowFormPostTarget) {
      // Listen for postMessage events triggered from within the `webflowFormPostTarget`
      if (this.$isCordovaApp && this.targetIsWindowOrRedirect)
        webflowFormPostTarget.addEventListener(
          "message",
          this._onWebFlowCompleted
        );
      else window.addEventListener("message", this._onWebFlowCompleted);
    },

    /**
     * @private
     * Initiate client-side web flow process (3D secure verification etc).
     * Show the Iframe => POST our hidden form's data to the Iframe, which will then display
     * the relevant bank's UI inside of the Iframe.
     */
    _startWebFlow() {
      this._reRenderFormAndIframe().then(async () => {
        if (this.paymentOptions.asyncPaymentResult) {
          InFlightTransactionPoller.fetchNow(); // poll for async payment results
        }

        // Determine the target we will post the hidden form to (either iframe, new tab)
        if (this.targetIsWindowOrRedirect) {
          // Display webflow in a new tab
          if (this.$isBrowserApp) {
            let name = "payment";
            webflowFormPostTarget = window.open(
              this.webFlowTargetType == "WINDOW"
                ? ""
                : this.transaction.webFlow.action,
              name
            );
            this.webflowFormPostTargetName = name;

            if (this.webFlowTargetType == "REDIRECT") {
              this._setupListeners(webflowFormPostTarget);

              return null; //hack to prevent cors issues caused by form posting of a redirect.
            }
          } else if (this.$isCordovaApp) {
            const url = this.webFlowTargetType === "REDIRECT"
              ? this.transaction.webFlow.action
              : this._generateWebFlowFormPageForCordova(this.transaction);

            await Browser.open({ 
              url: url,
              presentationStyle: 'popover'
            });
            webflowFormPostTarget = { 
              addEventListener: () => {},
              removeEventListener: () => {}
            };
          }
        } else if (this.webFlowTargetType == "IFRAME") {
          // Display webflow using iframe
          webflowFormPostTarget = this.$refs.webFlowIframe;
          this.webflowFormPostTargetName = this.$refs.webFlowIframe.name;
          // Only show the iframe when it has loaded
          this.$refs.webFlowIframe.onload = () =>
            (this.webFlowIframeLoaded = true);

          // Just in case, set a timer that will show the iframe after 8 seconds
          this.forceShowIframeTimer = setTimeout(
            () => (this.webFlowIframeLoaded = true),
            8 * 1000
          );
        }

        // Listen for postMessage events triggered from within the `webflowFormPostTarget`
        this._setupListeners(webflowFormPostTarget);

        // Initiate the web flow by submitting the form to the iframe
        if (this.$isCordovaApp && this.targetIsWindowOrRedirect)
          return null; // Cordova app auto-submits the form within the In App Browser in "WINDOW" mode, no need to do anything
        else Vue.nextTick(() => this.$refs.webFlowForm.submit());
      });
    },

    /**
     * @private
     * Once the user has completed the web flow process in the Iframe, we will
     * receive a callback with the response.
     */
    _onWebFlowCompleted(e) {
      // if (new URL(e.origin).host === new URL(process.env.VUE_APP_API).host) { // we can't check event's origin, Cordova doesn't send one
      if (
        e.data &&
        this.transaction &&
        e.data.orderId === this.transaction.orderId
      ) {
        this.checkoutInProgress = false;

        let transaction = new CardTransaction(e.data);

        if (this.paymentOptions.asyncPaymentResult) {
          CustomerService.acknowledgeTransaction(transaction);
          InFlightTransactionPoller.stop();
        }

        this._cleanup();

        transaction.success
          ? this._handleSuccessfulPayment(transaction)
          : this._handlePaymentError(null, transaction);
      }
    },

    /**
     * @private
     * The payment has been successfully processed.
     */
    _handleSuccessfulPayment(transaction) {
      this.checkoutInProgress = false;
      transaction.components = this._getTransactionComponents();

      this.$emit("success", transaction);
    },

    /**
     * @private
     * The payment has failed.
     * Display an error message to the user, detailing what went wrong with the payment
     */
    _handlePaymentError(error, transaction) {
      this.checkoutInProgress = false;
      this.paymentError = error || {
        code: transaction.resultCode,
        message: transaction.resultMessage,
      };
      this.paymentError.showVoucherWarning = this.vouchers.length > 0;

      logger.error("Nandos Web", "Payment Processor::", this.paymentError);

      // Clear any voucher's that were applied, as they will now be in a CANCELLED state
      this.vouchers = [];
      this.voucher_form.code = null;

      // Retrieve payment options again to make sure frontend is in-sync with middleware
      this.paymentService
        .getPaymentOptions()
        .then((options) => (this.paymentOptions = options))
        .then((_) => {
          if (this.paymentError.code == "CANCELLED") {
            this.$emit("cancelled", this.paymentError);
            this.paymentError = null;
          } else {
            this.$emit("failure", this.paymentError);
          }
        });
    },

    _getTransactionComponents() {
      // Build up a list of all the transactions that made up this payment
      let components = [];
      if (this.voucher_contributions > 0)
        components.push({ type: VOUCHER, amount: this.voucher_contributions });
      if (this.walletContribution > 0)
        components.push({ type: WALLET, amount: this.walletContribution });
      if (this.additional_payment_amount > 0)
        components.push({
          type: this.selectedPaymentType,
          amount: this.additional_payment_amount,
        });
      return components;
    },
    async _applyDriverTip() {
      try {
        if (this.driverTipAmount >= 0) {
          await this.paymentService.setDriverTip(this.driverTipAmount);
        }
      } catch (e) {
        console.warn("failed to set driver tip.");
      }
    },
    _addVoucher() {
      this.voucher_form.loading = true;
      this.voucher_form.error = null;
      this.paymentService
        .addVoucher(this.voucher_form.code)
        .then((response) => {
          if (response.success) {
            // Reset form
            this.voucher_form.code = null;
            this.$refs.voucherForm.reset();

            this.vouchers.push(response.voucher);
            this.$toaster.show(
              this.$t("paymentProcessor.paymentTypes.VOUCHER.form.applied"),
              {
                parent: this,
                success: true,
              }
            );
          } else {
            this.voucher_form.error =
              response.resultMessage ||
              this.$t("paymentProcessor.paymentTypes.VOUCHER.form.error");
          }
          if (response.updatedRequirements) {
            this.paymentOptions = response.updatedRequirements; // Wallet status might change etc
          }
        })
        .catch((e) =>
          this.$toaster.show(
            this.$t("paymentProcessor.paymentTypes.VOUCHER.form.error"),
            { parent: this, error: true }
          )
        )
        .finally(() => (this.voucher_form.loading = false));
    },

    _removeVoucher(voucher) {
      this.voucher_form.removeVoucher = voucher.code;
      this.paymentService
        .removeVoucher(voucher)
        .then((response) => {
          this.vouchers.splice(this.vouchers.indexOf(voucher), 1);
          this.paymentOptions = response.updatedRequirements; // Wallet status might change etc
          this.$toaster.show(
            this.$t("paymentProcessor.paymentTypes.VOUCHER.form.removed"),
            { parent: this }
          );
        })
        .finally(() => (this.voucher_form.removeVoucher = null));
    },

    retry() {
      this.paymentError = null; // clear error, so user can retry payment
    },

    getI18nErrorMessagePath() {
      if (this.paymentError) {
        let key = `paymentProcessor.errors.types.${this.paymentError.code}`;
        let exists = NandosI18n.i18nHasMessage(key);
        if (exists) return key;
      }

      return `paymentProcessor.errors.types.UNKNOWN_ERROR`;
    },

    _cleanup() {
      window.removeEventListener("message", this._onWebFlowCompleted);

      // Reset
      if (this.targetIsWindowOrRedirect) {
        if (webflowFormPostTarget) {
          if (this.$isCordovaApp)
            webflowFormPostTarget.removeEventListener(
              "message",
              this._onWebFlowCompleted
            );
          webflowFormPostTarget.close();
        }
      } else if (this.webFlowTargetType == "IFRAME") {
        clearTimeout(this.forceShowIframeTimer);
        this.$refs.webFlowIframe.onload = null;
        this.webFlowIframeLoaded = false;
      }

      webflowFormPostTarget = null;
    },
  },

  beforeDestroy() {
    this._cleanup();
  },
};
