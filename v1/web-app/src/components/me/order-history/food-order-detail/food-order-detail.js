import CustomerService from "nandos-middleware-api/service/customer/me-service";
import MenuService from "nandos-middleware-api/service/menu/my-menu-service";
import PublicOrderTrackingService from "nandos-middleware-api/service/public-order-tracking-service";
import StoreService from "nandos-middleware-api/service/store-service";
import { KERBSIDE_STATUSES } from "nandos-middleware-api/model/kerbside-state";
import { ORDER_TYPES } from "nandos-middleware-api/model/food-basket";
import BasketService from "nandos-middleware-api/service/basket/my-basket-service";
import GlobalConfigService from "nandos-middleware-api/service/global-config-service";
import { PROGRESS_STATUSES } from "nandos-middleware-api/model/order-fulfilment-progress";
import { RouterUtils, PlaceholderBackground } from "nandos-core-ui";
import { pollPromise } from "nandos-timing-utils";
import OrderTypeKey from "nandos-i18n/src/filters/order-type-key";
import { Browser } from '@capacitor/browser';

const POLL_INTERVAL = 20;

const context = require.context(
  "@/assets/img/fulfilment-status",
  true,
  /\.(svg)$/
);
const FULFILMENT_STATUS_IMAGES = {};
context.keys().forEach(function (filename) {
  FULFILMENT_STATUS_IMAGES[filename] = context(filename);
});

export default {
  mixins: [RouterUtils, PlaceholderBackground],

  props: {
    orderId: { type: String, required: false },
    publicTrackingToken: { type: String, required: false }, // Allows non-registered users to see the food order detail view and track their order's fulfilment status
  },

  data() {
    return {
      ORDER_TYPES,
      PROGRESS_STATUSES,
      basket: null,
      configs: null,
      customer: null,
      store: null,
      heroProduct: null,
      customerHadFlavourPreference: false,
      show_order_rating_form: false,
      show_invoice_form: false,
      showChangeKerbsideStateDialog: false,
      showTrackingInfoNewlyAvailableDialog: false,
      kerbsideStatusLoading: false,
      KERBSIDE_STATUSES,
      form_data: { email: "" },
      reorder_loading: false,
      send_invoice_loading: false,
      progressAnimation: null,
      loadDeliveryTracking: false,
      showDeliveryTracking: false,
      poller: pollPromise(this.getOrderData, POLL_INTERVAL),
      seed: 6, // Used to seed Placeholder Background mixin
      IOS_APP_STORE_ID: process.env.VUE_APP_IOS_APP_STORE_ID,
      ANDROID_APP_STORE_ID: process.env.VUE_APP_ANDROID_APP_STORE_ID,
      HUAWEI_APP_STORE_ID: process.env.VUE_APP_HUAWEI_APP_STORE_ID,
      PERI_PLAYGROUND_URL: process.env.VUE_APP_PERI_PLAYGROUND_URL,
    };
  },

  computed: {
    ready() {
      return (
        this.basket != null &&
        this.configs != null &&
        this.customer != null &&
        this.store != null
      );
    },

    isPublicTrackingContext() {
      return this.publicTrackingToken != null;
    },

    orderIsComplete() {
      return (
        this.ready &&
        this.basket.fulfilmentProgress.status == PROGRESS_STATUSES.FULFILLED
      );
    },

    canReorder() {
      return (
        this.ready &&
        (Date.now() - this.basket.orderExpectedTime) / 1000 / 60 >= 60
      ); // ETA was over an hour ago
    },

    kerbsideOnlyCollection() {
      return this.configs.kerbsideOnlyCollection == true;
    },

    fulfilmentStatusImage() {
      switch (this.basket.fulfilmentProgress.status) {
        case PROGRESS_STATUSES.PENDING:
        case PROGRESS_STATUSES.ACCEPTED:
        case PROGRESS_STATUSES.PREPARING:
        case PROGRESS_STATUSES.PREPARED:
        case PROGRESS_STATUSES.DELIVERY_ACCEPTED:
        case PROGRESS_STATUSES.DELIVERY_PENDING:
          return FULFILMENT_STATUS_IMAGES["./grill.svg"];

        case PROGRESS_STATUSES.COLLECTION_READY:
          return FULFILMENT_STATUS_IMAGES["./bag.svg"];

        case PROGRESS_STATUSES.DELIVERY_DEPARTED:
        case PROGRESS_STATUSES.DELIVERY_ARRIVED:
          return FULFILMENT_STATUS_IMAGES["./scooter.svg"];

        case PROGRESS_STATUSES.FULFILLED:
          return FULFILMENT_STATUS_IMAGES["./done.svg"];
      }
    },

    allowKerbsideCustomerActions() {
      return this.configs.kerbsideCustomerActionDisabled != true;
    },

    storeDirectionsUrl() {
      return this.basket.orderType == ORDER_TYPES.COLLECTION && this.store
        ? `https://www.google.com/maps/dir/?api=1&destination=${this.store.latitude},${this.store.longitude}&dir_action=navigate`
        : null;
    },

    appHeaderColor() {
      if (!this.basket) return null;
      switch (this.basket.orderType) {
        case ORDER_TYPES.DELIVERY:
          return [100, 195, 190];
        case ORDER_TYPES.COLLECTION:
          return [195, 220, 155];
        case ORDER_TYPES.EAT_IN:
          return [255, 205, 65];
      }
    },

    overlapAppHeader() {
      return this.$breakpoints.smDown;
    },

    orderTypeKey() {
      return OrderTypeKey(this.basket);
    },

    twoColumnLayout() {
      return this.$breakpoints.mdUp;
    },

    isDeliveryTrackingAvailable() {
      return (
        this.ready &&
        this.basket.fulfilmentProgress.deliveryTrackingUrl != null &&
        (this.basket.fulfilmentProgress.status ==
          PROGRESS_STATUSES.DELIVERY_DEPARTED ||
          this.basket.fulfilmentProgress.status ==
            PROGRESS_STATUSES.DELIVERY_ARRIVED)
      );
    },
  },

  watch: {
    showDeliveryTracking(newVal) {
      if (newVal == true) this.loadDeliveryTracking = true;
    },
  },

  created() {
    this.poller.start();

    Promise.all([
      this.getOrderData(),
      CustomerService.getMe(),
      GlobalConfigService.getConfigs(),
    ])
      .then(([order, customer, configs]) => {
        this.configs = configs;
        this.customer = customer;

        this.form_data.email = customer.email;
        this.customerHadFlavourPreference =
          customer.preferences.flavour != null;
      })
      .then(() => StoreService.getStore(this.basket.storeId))
      .then((store) => (this.store = store))
      .then(
        () =>
          (this.showDeliveryTracking =
            this.isDeliveryTrackingAvailable &&
            this.$route.query.showDeliveryTracking != null)
      )
      .then(() => this.getOrderProductImages(this.basket));
  },

  methods: {
    getOrderData() {
      return (
        this.isPublicTrackingContext
          ? PublicOrderTrackingService.getOrder(this.publicTrackingToken)
          : CustomerService.getFoodOrder(this.orderId)
      )
        .then((order) => {
          let previousBasket = this.basket;
          let previousTrackingAvailability = this.isDeliveryTrackingAvailable;

          this.basket = order;

          if (
            previousBasket != null &&
            previousTrackingAvailability == false &&
            this.isDeliveryTrackingAvailable == true
          )
            this.showTrackingInfoNewlyAvailableDialog = true;

          if (this.basket.isActiveOrder == false) this.poller.stop();

          return this.basket;
        })
        .catch((e) => {
          if (this.isPublicTrackingContext)
            this.$toaster.show(
              this.$t("profile.history.detail.food.public.tokenError"),
              { parent: this }
            );
          this.navigateUp();
        });
    },

    getOrderProductImages(basket) {
      let mostExpensive = basket.items.reduce((prev, current) =>
        prev.productPrice > current.productPrice ? prev : current
      );

      MenuService.getProductDefinitionIdFromOheicsId(mostExpensive.oheicsId)
        .then((definitionId) =>
          MenuService.retrieveUserProductFromDefinitionId(definitionId)
        )
        .then((product) => (this.heroProduct = product));
    },

    reorder() {
      this.reorder_loading = true;
      BasketService.reorder(this.basket.id)
        .then(() => this.$router.push({ name: "basket" }))
        .then(() => (this.reorder_loading = false));
    },

    updateKerbsideState(status, coordinates) {
      this.kerbsideStatusLoading = true;
      (this.isPublicTrackingContext
        ? PublicOrderTrackingService.updateKerbsideState(
            this.publicTrackingToken,
            status,
            coordinates
          )
        : BasketService.updateKerbsideState(this.basket.id, status, coordinates)
      )
        .then(() => {
          let msg = "";
          switch (status) {
            case KERBSIDE_STATUSES.CUSTOMER_DEPARTED:
              msg = this.$t(
                "profile.history.detail.food.kerbside.departed.done"
              );
              break;
            case KERBSIDE_STATUSES.CUSTOMER_ARRIVED:
              msg = this.$t(
                "profile.history.detail.food.kerbside.arrived.done"
              );
              break;
            case KERBSIDE_STATUSES.ASSISTANCE_REQUIRED:
              msg = this.$t("profile.history.detail.food.kerbside.help.done");
              break;
          }

          this.$toaster.show(msg, { parent: this, success: true });
        })
        .finally(() => {
          this.showChangeKerbsideStateDialog = false;
          this.kerbsideStatusLoading = false;

          this.poller.start(); // restart poller
          this.getOrderData();
        });
    },

    getInvoice() {
      this.send_invoice_loading = true;
      CustomerService.getFoodOrderInvoice(
        this.basket.id,
        this.form_data.email
      ).then(() => {
        this.$toaster.show(this.$t("profile.history.invoice.sent"), {
          parent: this,
        });
        this.show_invoice_form = false;
        this.send_invoice_loading = false;
      });
    },

    setCustomerFlavourPreference() {
      CustomerService.updateCustomer(this.customer).then((customer) => {
        this.customer = customer;
        this.$toaster.show(
          this.$t("profile.history.detail.food.flavourPreference.saved")
        );
      });
    },

    async handleTrackingWebview() {
      if (this.$isCordovaApp && process.env.VUE_APP_CONTEXT === "IOS") {
        await Browser.open({ 
          url: this.basket.fulfilmentProgress.deliveryTrackingUrl,
          presentationStyle: 'popover'
        });
      } else {
        this.showDeliveryTracking = true;
        this.showTrackingInfoNewlyAvailableDialog = false;
      }
    },
  },

  beforeDestroy() {
    this.poller.stop();
  },
};
