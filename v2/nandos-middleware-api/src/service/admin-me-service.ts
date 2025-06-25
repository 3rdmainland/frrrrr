import '../util/admin-context-guard';
import Observable from '../util/observable';
import AuthService, { AUTH_CHANGED } from './auth-service';
import User from '../model/user';
import ApiHttp from '../http';
import type { TAdminUser, TAdminUserUpdate } from '@nandos-types/response/admin-user';
import type { IUser } from '@nandos-types/model/user';

export const ME_UPDATED = 'ME_UPDATED';

class AdminMeService extends Observable {

	private _meCache: User | null;

	constructor() {
		super();

		this._meCache = null;

		AuthService.addObserver(this, AUTH_CHANGED, () => {
			this._meCache = null;
			this.notifyObservers(ME_UPDATED);
		});
	}

	getMe(bypassCache: boolean) {
		if(!bypassCache && this._meCache) return Promise.resolve(new User(this._meCache));

		return ApiHttp.get<TAdminUser>(`/admin/users/me`)
			.then(response => this._meCache = new User(response.data.user))
	}

	updateMe(user: IUser) {
		return ApiHttp.put<TAdminUserUpdate>(`/admin/users/me`, user)
			.then(response => {
				this._meCache = new User(response.data.user);
				this.notifyObservers(ME_UPDATED);
				return this._meCache;
			});
	}
}

export default new AdminMeService();