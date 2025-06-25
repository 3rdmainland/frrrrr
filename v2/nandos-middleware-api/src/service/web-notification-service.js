import logger from 'nandos-dev-logger'
import '../util/web-context-guard'
import * as firebase from 'firebase/app';
import 'firebase/messaging';

export default class WebNotificationService {

	constructor(notifyService) {
		this._notifyService = notifyService
		this._token = null
		this._fcm = null
	}

	get supportsNotifications() {
		return ('Notification' in window) && ('serviceWorker' in navigator)
	}

	get token() {
	  return this._token
	}

	init(serviceWorker, senderId, publicVapidKey) {
    firebase.initializeApp({'messagingSenderId': senderId})
    this._fcm = firebase.messaging()
    this._fcm.usePublicVapidKey(publicVapidKey)
    this._fcm.useServiceWorker(serviceWorker)
    this._fcm.onMessage(this._onMessage.bind(this))
    this._fcm.onTokenRefresh(this._onTokenRefreshed.bind(this))

    this._getToken()
	}

	_getToken() {
    return this._fcm.getToken()
      .then(token => {
        if (token) {
        	this._setNewToken(token)
          return token
        } else {
          // No Instance ID token available. Request permission first...
          return this._requestPermission().then(() => this._getToken())
        }
      })
      .catch(e => logger.error('Nandos Middleware', 'An error occurred while retrieving token. ', e))
	}

	_setNewToken(token) {
	  this._token = token
	  this._notifyService.onTokenChanged(token)
	}

	_requestPermission() {
	  return this._fcm.requestPermission()
	    .catch(e => logger.warn('Nandos Middleware', 'Unable to get permission to notify.', e))
	}

	_onMessage(payload) {
		this._notifyService.incomingMessage(payload)
	}

	_onTokenRefreshed() {
	  return this._getToken()
	}
}