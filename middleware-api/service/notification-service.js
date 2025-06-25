import logger from 'nandos-dev-logger'
import '../util/web-context-guard'
import Observable from '../util/observable'
import AuthService from './auth-service'
import CordovaNotificationService from './cordova-notification-service'
//import WebNotificationService from './web-notification-service'

export const NOTIFICATION_RECEIVED = 'NOTIFICATION_RECEIVED'
export const NOTIFICATION_ACTIONED = 'NOTIFICATION_ACTIONED'

class NotificationService extends Observable {

	constructor() {
		super()

		// Initialise the appropriate SDK
		this.sdk = process.env.VUE_APP_CONTEXT == 'WEB'
			? null //new WebNotificationService(this)
			: new CordovaNotificationService(this)
	}


	init() {
		this.sdk.init(...arguments)
	}

	get token() {
	  return this.sdk && this.sdk.token
	}

	onTokenChanged(token) {
		AuthService.setPushNotificationToken(token)
	}

	onPushNotificationReceived(notification) {
		this.notifyObservers(NOTIFICATION_RECEIVED, notification)
		logger.log('Nandos Middleware', 'Notification Service::', 'onPushNotificationReceived', notification)
	}

	onPushNotificationActioned(data) {
		this.notifyObservers(NOTIFICATION_ACTIONED, data)
		logger.log('Nandos Middleware', 'Notification Service::', 'onPushNotificationActioned', data)
	}
}

export default new NotificationService()