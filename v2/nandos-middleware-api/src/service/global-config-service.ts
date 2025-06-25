import ApiHttp from '../http';
import type { IPlatformConfiguration } from '@nandos-types/model/platform-configuration';
import type { TPlatformConfiguration } from '@nandos-types/response/platform-configuration';

const APLICATION_CONTEXT = import.meta.env.VITE_CONTEXT;

/**
 * Provides runtime configurations for the current application context.
 */
class GlobalConfigService {

  private cache: Promise<IPlatformConfiguration> | IPlatformConfiguration | null;

  constructor() {
    this.cache = null;
    this.getGoogleMapsApiKey = this.getGoogleMapsApiKey.bind(this);
  }

  getConfigs() {
    return this.cache || (this.cache = ApiHttp.get<TPlatformConfiguration>(`/configuration/${APLICATION_CONTEXT}`)
      .then(response => response.data.configuration)
      .catch(e => {
        this.cache = null
        return Promise.reject(e)
      }))
  }

  getAvailableFlavours() {
    return this.getConfigs().then(configs => configs.flavours);
  }

  getGoogleMapsApiKey() {
    return this.getConfigs().then(configs => configs.googleMapsApiKey)
  }
}

export default new GlobalConfigService();