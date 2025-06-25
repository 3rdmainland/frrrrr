import { RateApp } from 'capacitor-rate-app'
import logger from 'nandos-dev-logger'

export const requestReview = () => {
  if(process.env.VUE_APP_CONTEXT == 'WEB') {
    return false // We don't prompt for rating in web context
  }
  else {
    try {
      RateApp.requestReview()
    } catch (error) {
      logger.log(error)
    }
  }
}