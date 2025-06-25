import NandosCoreUi, {
  ViewStateService,
  GoogleMapsApiConfig,
  RoutableConfig,
} from "nandos-core-ui";
import Router from "../router";
import NandosI18n from "nandos-i18n";
import GlobalConfigService from "nandos-middleware-api/service/global-config-service";
import { PHONE_INPUT_SETTINGS } from "nandos-core-ui/src/components/forms/phone-input.vue";
import { Browser } from '@capacitor/browser';

export default function (Vue) {
  Vue.use(NandosCoreUi);

  Vue.prototype.$toaster.router = Router;
  Vue.prototype.$toaster.i18n = NandosI18n.i18n;
  ViewStateService.init(Router);
  GoogleMapsApiConfig.apiKeyResolver = GlobalConfigService.getGoogleMapsApiKey;
  GoogleMapsApiConfig.libraries = ["places"];

  PHONE_INPUT_SETTINGS.allowInternational =
    process.env.VUE_APP_ALLOW_INTL_PHONE_NUMBER == "true";
  PHONE_INPUT_SETTINGS.defaultRegion = process.env.VUE_APP_REGION;

  window.cordova &&
    document.addEventListener("deviceready", () => {
      // Open external links using Capacitor Browser
      RoutableConfig.externalLinkHandler = async (e, target = "_system") => {
        e.preventDefault();

        if (target === "_blank") {
          await Browser.open({ 
            url: e.currentTarget.href,
            presentationStyle: 'popover'
          });
        } else {
          await Browser.open({ 
            url: e.currentTarget.href,
            windowName: target
          });
        }
      };
    });
}
