const IS_BROWSER_APP = process.env.VUE_APP_CONTEXT == 'WEB'
import { Geolocation } from '@capacitor/geolocation';

export function getPosition(_options) {
  const options = Object.assign({timeout: 5000, maximumAge: 1800000, enableHighAccuracy: true}, _options)
  if(IS_BROWSER_APP) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(position => resolve(position.coords), reject, options)
    })
  }
  else {
    return Geolocation.getCurrentPosition(options)
      .then(position => position.coords)
  }
}