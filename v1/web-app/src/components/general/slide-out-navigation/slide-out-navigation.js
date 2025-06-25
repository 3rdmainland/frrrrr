import { slideOutNavItems } from "@/navigation";
import AuthService from "nandos-middleware-api/service/auth-service";
import CustomerService, {
  CUSTOMER_UPDATED,
} from "nandos-middleware-api/service/customer/me-service";
import { Toggleable } from "nandos-core-ui";
import LanguageService from "nandos-middleware-api/service/my-language-service";

export default {
  mixins: [Toggleable],

  data() {
    return {
      languageService: LanguageService,
      user: null,
      nav_items: null,
      PERI_PLAYGROUND_URL: process.env.VUE_APP_PERI_PLAYGROUND_URL,
    };
  },

  computed: {
    isSignedInUser() {
      return this.user && !this.user.anonymous;
    },

    dockToRight() {
      return this.languageService.rtl;
    },
  },

  watch: {
    user: "getNavItems",
    "languageService.language": "getNavItems",
  },

  created() {
    this.getUser();
    CustomerService.addObserver(this, CUSTOMER_UPDATED, () => this.getUser());
  },

  beforeDestroy() {
    CustomerService.removeObserver(this, CUSTOMER_UPDATED);
  },

  methods: {
    getUser() {
      return CustomerService.getMe().then((me) => (this.user = me));
    },

    getNavItems() {
      return slideOutNavItems(this.user, this.$isBrowserApp).then(
        (nav_items) => (this.nav_items = nav_items)
      );
    },

    logout() {
      AuthService.logOut().then(() => {
        this.$router.push("/");
        this.isActive = false;
        this.$toaster.show(this.$t("nav.didLogOut"));
      });
    },
  },
};
