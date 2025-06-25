import '../util/admin-context-guard'
import Observable from '../util/observable'
import AuthService, { AUTH_CHANGED } from './auth-service';
import User from '../model/user';
import ApiHttp from '../http';

export const ME_UPDATED = 'ME_UPDATED';

class AdminMeService extends Observable {

	constructor() {
		super();

		this._meCache = null;

		AuthService.addObserver(this, AUTH_CHANGED, () => {
			this._meCache = null;
			this.notifyObservers(ME_UPDATED);
		});
	}

	getMe(bypassCache) {
		if(!bypassCache && this._meCache) return Promise.resolve(new User(this._meCache));

		return ApiHttp.get(`/admin/users/me`)
			.then(response => this._meCache = new User(response.data.user))
	}

	updateMe(user) {
		return ApiHttp.put(`/admin/users/me`, user)
			.then(response => {
				this._meCache = new User(response.data.user);
				this.notifyObservers(ME_UPDATED);
				return this._meCache;
			});
	}
}

export default new AdminMeService();