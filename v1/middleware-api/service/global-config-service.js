import ApiHttp from '../http';

const APLICATION_CONTEXT = process.env.VUE_APP_CONTEXT

/**
 * Provides runtime configurations for the current application context.
 */
class GlobalConfigService {

  constructor() {
    this.cache = null
    this.getGoogleMapsApiKey = this.getGoogleMapsApiKey.bind(this)
  }

  getConfigs() {
    return this.cache || (this.cache = ApiHttp.get(`/configuration/${APLICATION_CONTEXT}`)
      .then(response => response.data.configuration)
      .catch(e => {
        this.cache = null
        return Promise.reject(e)
      }))
  }

  getAvailableFlavours() {
    return this.getConfigs()
      .then(configs => configs.flavours)
  }

  getGoogleMapsApiKey() {
    return this.getConfigs()
      .then(configs => configs.googleMapsApiKey)
  }
}

export default new GlobalConfigService();