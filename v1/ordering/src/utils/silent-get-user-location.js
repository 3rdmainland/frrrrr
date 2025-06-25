const IS_BROWSER_APP = process.env.VUE_APP_CONTEXT == 'WEB'
import { getPosition } from './get-user-location';
import { Geolocation } from '@capacitor/geolocation';

// Silently retrieve the user's location (if permission has already been granted)
export default function (options) {
  return (IS_BROWSER_APP ? _isGeolocationPermissionGrantedWeb() : _isGeolocationPermissionGrantedCordova())
    .then(granted => getPosition(options))
}

function _isGeolocationPermissionGrantedWeb() {
  return new Promise((resolve, reject) => {
    if(navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(result => {
          if (result.state == 'granted') resolve(true)
          else reject(new Error('Geolocation permission has been denied or not granted yet...'))
        })
    }
    else {
      reject(new Error('Permission API is not supported'))
    }
  })
}

function _isGeolocationPermissionGrantedCordova() {
  return Geolocation.checkPermissions()
    .then(permissionStatus => {
      if(permissionStatus.location == 'granted') return true
      else throw new Error('Geolocation permission has been denied or not granted yet...')
    })
}