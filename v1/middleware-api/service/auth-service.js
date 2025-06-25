import logger from 'nandos-dev-logger'
import Axios from 'axios'
import ApiHttp from '../http';
import Observable from '../util/observable'

export const AUTH_SERVICE_SETTINGS = {
	localStorageKey: 'nandos-credentials'
};
export const AUTH_CHANGED = 'AUTH_CHANGED';

export const OTP_TYPE = {
	CONFIRM_MOBILEPHONE: 'CONFIRM_MOBILEPHONE',
	RESET_PASSWORD: 'RESET_PASSWORD',
	UNREGISTER: 'UNREGISTER',
}

class AuthService extends Observable {

	constructor() {
		super();
		this._credentials = null;
		this._tokenRefreshInProgress = false;
		this._cachedAnonymousLoginPromise = null;
	}

	refreshToken() {
		if(!this._tokenRefreshInProgress) {
			this._tokenRefreshInProgress = true;
			ApiHttp.get('/auth/extend')
				.then(r => {
					// Guard against race condition where refreshed token was for a customer that is no longer the current customer
					if(r.data.credentials.id == this.getCredentials().id) {
						this._processAuthResponse(r)
					}
				})
				.then(() => this._tokenRefreshInProgress = false)
		}	
	}

	getTimeToTokenExpiration () {
		return this.getCredentials()
		 ? this.getCredentials().expiry - Date.now()
		 : 0
	}

	applyCredentials(credentials) {
		this._setCredentials(credentials)
	}

	getCredentials() {
		if (! this._credentials) {
			try {
				this._credentials = JSON.parse(localStorage.getItem(AUTH_SERVICE_SETTINGS.localStorageKey));
			} catch(e) {}
		}
		return this._credentials;
	}

	_setCredentials(credentials) {
		this._credentials = credentials;
		try {
			localStorage.setItem(AUTH_SERVICE_SETTINGS.localStorageKey, JSON.stringify(this._credentials));
		} catch(e) {
			logger.warn('Nandos Middleware', 'localStorage not available')
		}
	}

	_processAuthResponse(response) {
		if (response.data.credentials) {
			this._setCredentials(response.data.credentials);
			this.notifyObservers(AUTH_CHANGED);
		}
		
		return response;
	}

	anonymousLogin() {
		if(this._cachedAnonymousLoginPromise) return this._cachedAnonymousLoginPromise;
		return this._cachedAnonymousLoginPromise =  Axios.post(ApiHttp.defaults.baseURL + '/auth/login/anonymous')
			.then(r => {
				this._processAuthResponse(r.data);
				this._cachedAnonymousLoginPromise = null;
				return r
			})
			.catch(e => {
				this._cachedAnonymousLoginPromise = null
				return Promise.reject(e)
			})
	}

	mobileLogin(mobilePhoneNumber, password, recaptchaToken) {
		let data = {mobilePhoneNumber, password, recaptchaToken};
		return ApiHttp.post('/auth/login/password/mobile', data).then(r => this._processAuthResponse(r));
	}

	emailLogin(email, password) {
		return ApiHttp.post('/auth/login/password/email', {email, password})
			.then(r => this._processAuthResponse(r))
			.then(r => r.data)
	}

	startTwoFactorLogin(email, password, recaptchaToken) {
		return ApiHttp.post('/auth/login/two-factor/initiate', {email, password, recaptchaToken})
			.then(r => this._processAuthResponse(r))
			.then(r => r.data)
	}

	twoFactorLogin(email, password, otp) {
		return ApiHttp.post('/auth/login/two-factor', {email, password, otp})
			.then(r => this._processAuthResponse(r));
	}

	passwordRegister(data, recaptchaToken) {
		const payload = Object.assign({}, data, {recaptchaToken})
		return ApiHttp.post('/auth/register/password', payload).then(r => this._processAuthResponse(r));
	}

	verifyRegistration(otp) {
		return ApiHttp.post('/auth/register/verify', {otp})
			.then(r => this._processAuthResponse(r))
			.then(r => this.notifyObservers(AUTH_CHANGED))
	}

	resendVerification(mobilePhoneNumber) {
		return ApiHttp.post('/auth/register/resend', {mobilePhoneNumber});
	}

	resetPassword(mobilePhoneNumber, newPassword, recaptchaToken) {
		return ApiHttp.post('/auth/password/reset', {mobilePhoneNumber, newPassword, recaptchaToken});
	}

	verifyResetPassword(mobilePhoneNumber, otp) {
		return ApiHttp.post('/auth/password/reset/verify', {mobilePhoneNumber, otp})
			.then(r => this._processAuthResponse(r));
	}

	resetPasswordViaEmail(email, newPassword, recaptchaToken) {
		return ApiHttp.post('/auth/admin/password/email/reset', {email, newPassword, recaptchaToken});
	}

	verifyResetPasswordViaEmail(email, otp) {
		return ApiHttp.post('/auth/admin/password/email/reset/verify', {email, otp})
			.then(r => this._processAuthResponse(r));
	}

	changeMobilePhone(newMobilePhoneNumber) {
		return ApiHttp.post('/auth/mobile_phone/change', {newMobilePhoneNumber});
	}

	verifyChangeMobilePhone(newMobilePhoneNumber, otp) {
		return ApiHttp.post('/auth/mobile_phone/change/verify', {newMobilePhoneNumber, otp})
			.then(r => this._processAuthResponse(r));
	}

	changePassword(password, newPassword) {
		let data = {'password': password, 'newPassword': newPassword};
		return ApiHttp.post('/auth/password/change', data);
	}

	startAccountDeletion() {
		return ApiHttp.post('/auth/delete')
	}

	verifyAccountDeletion(otp) {
		return ApiHttp.post('/auth/delete/verify', {otp})
			.then(() => this.anonymousLogin())
	}

	generateAuthTokenForDevice(userAgent) {
		return ApiHttp.post('/auth/authoriseUserAgent', {userAgent})
			.then(response => response.data.credentials)
	}

	setPushNotificationToken(token) {
		return ApiHttp.post(`/auth/device/token/${token}`, {token, platform: process.env.VUE_APP_CONTEXT})
	}

	logOut() {
		return this.anonymousLogin();
	}

	logOutOfAllDevices() {
		return ApiHttp.post('/auth/revoke_all')
			.then(() => this.anonymousLogin())
	}

}

export default new AuthService();