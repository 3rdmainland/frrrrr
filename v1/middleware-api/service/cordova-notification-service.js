import { ActionPerformed, PushNotificationSchema, PushNotifications, Token, } from '@capacitor/push-notifications';
import logger from 'nandos-dev-logger'
import '../util/web-context-guard'
let Firebase;

export default class CordovaNotificationService {

	constructor(notifyService) {
    this._notifyService = notifyService
    this._token = null
	}

  get supportsNotifications() {
    return true
  }

  get token() {
    return this._token
  }

  set token(token) {
    this._notifyService.onTokenChanged(token)
    this._token = token
  }

  init() {
    PushNotifications.requestPermissions()
      .then(result => {
        if (result.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          PushNotifications.register();
        } else {
          // Show some error
        }
      })

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', token => this.token = token.value)

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', error => logger.log('Error on registration: ' + JSON.stringify(error)))

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', notification => this._notifyService.onPushNotificationReceived(notification))

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', data => this._notifyService.onPushNotificationActioned(data))
  }
}