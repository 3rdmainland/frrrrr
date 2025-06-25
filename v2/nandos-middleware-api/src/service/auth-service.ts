import Axios, { AxiosResponse } from "axios";
import Observable from "../util/observable";
import ApiHttp from "../http";
import { type IAuthRequest } from '@nandos-types/model/auth-request'; 
import { type ISecureToken } from '@nandos-types/model/secure-token';
import { type TAuthResponse } from '@nandos-types/response/auth';

export const AUTH_SERVICE_SETTINGS = {
  localStorageKey: "nandos-credentials",
};

export const AUTH_CHANGED = "AUTH_CHANGED";

export const OTP_TYPE = {
  CONFIRM_MOBILEPHONE: "CONFIRM_MOBILEPHONE",
  RESET_PASSWORD: "RESET_PASSWORD",
  UNREGISTER: "UNREGISTER",
};

class AuthService extends Observable {
  private _credentials: ISecureToken | null;
  private _tokenRefreshInProgress: boolean;
  private _cachedAnonymousLoginPromise: Promise<AxiosResponse<any, any>> | null;

  constructor() {
    super();
    this._credentials = null;
    this._tokenRefreshInProgress = false;
    this._cachedAnonymousLoginPromise = null;

    const storageCreds = localStorage.getItem(
      AUTH_SERVICE_SETTINGS.localStorageKey
    );
    if (!storageCreds) {
      this.anonymousLogin();
    }
  }

  refreshToken() {
    if (!this._tokenRefreshInProgress) {
      this._tokenRefreshInProgress = true;
      ApiHttp.get("/auth/extend")
        .then((r) => {
         if (r.data.credentials.id == this.getCredentials()?.id) {
            this._processAuthResponse(r);
          }
          return r;
        })
        .catch(error => {
          console.error("Token refresh failed:", error);
          return Promise.reject(error);
        })
        .finally(() => {
          this._tokenRefreshInProgress = false;
        });
    }
  }

  getTimeToTokenExpiration() {
    const creds = this.getCredentials();
    return creds ? creds.expiry - Date.now() : 0;
  }

  applyCredentials(credentials: ISecureToken) {
    this._setCredentials(credentials);
  }

  getCredentials() {
    if (!this._credentials) {
      try {
        const storageCreds = localStorage.getItem(
          AUTH_SERVICE_SETTINGS.localStorageKey
        );
        this._credentials = storageCreds ? JSON.parse(storageCreds) : null;
      } catch (e) {}
    }
    return this._credentials;
  }

  private _setCredentials(credentials: ISecureToken) {
    this._credentials = credentials;
    try {
      localStorage.setItem(
        AUTH_SERVICE_SETTINGS.localStorageKey,
        JSON.stringify(this._credentials)
      );
    } catch (e) {
      console.warn("Nandos Middleware", "localStorage not available");
    }
  }

  private _processAuthResponse<T extends Record<string, any>>(response: T): T {
    if (response.data.credentials) {
      this._setCredentials(response.data.credentials);
      this.notifyObservers(AUTH_CHANGED);
    }

    return response;
  }

  anonymousLogin() {
    if (this._cachedAnonymousLoginPromise)
      return this._cachedAnonymousLoginPromise;

    return (this._cachedAnonymousLoginPromise = Axios.post(
      ApiHttp.defaults.baseURL + "/auth/login/anonymous"
    )
      .then((r) => {
        this._processAuthResponse(r.data);
        this._cachedAnonymousLoginPromise = null;
        return r;
      })
      .catch((e) => {
        this._cachedAnonymousLoginPromise = null;
        return Promise.reject(e);
      }));
  }

  mobileLogin(
    mobilePhoneNumber: string,
    password: string,
    recaptchaToken: string
  ) {
    let data = { mobilePhoneNumber, password, recaptchaToken };
    return ApiHttp.post("/auth/login/password/mobile", data).then((r) =>
      this._processAuthResponse(r)
    );
  }

  emailLogin(email: string, password: string) {
    return ApiHttp.post("/auth/login/password/email", { email, password })
      .then((r) => this._processAuthResponse(r))
      .then((r) => r.data);
  }

  startTwoFactorLogin(email: string, password: string, recaptchaToken: string) {
    return ApiHttp.post("/auth/login/two-factor/initiate", {
      email,
      password,
      recaptchaToken,
    })
      .then((r) => this._processAuthResponse(r))
      .then((r) => r.data);
  }

  twoFactorLogin(email: string, password: string, otp: string) {
    return ApiHttp.post("/auth/login/two-factor", {
      email,
      password,
      otp,
    }).then((r) => this._processAuthResponse(r));
  }

  passwordRegister(data: Partial<IAuthRequest>, recaptchaToken: string): Promise<TAuthResponse> {
    const payload = Object.assign({}, data, { recaptchaToken });
    return ApiHttp.post<TAuthResponse>("/auth/register/password", payload).then((r) =>
      this._processAuthResponse(r)
    );
  }

  verifyRegistration(otp: string) {
    return ApiHttp.post("/auth/register/verify", { otp })
      .then((r) => this._processAuthResponse(r))
      .then((r) => this.notifyObservers(AUTH_CHANGED));
  }

  resendVerification(mobilePhoneNumber: string) {
    return ApiHttp.post("/auth/register/resend", { mobilePhoneNumber });
  }

  resetPassword(
    mobilePhoneNumber: string,
    newPassword: string,
    recaptchaToken: string
  ) {
    return ApiHttp.post("/auth/password/reset", {
      mobilePhoneNumber,
      newPassword,
      recaptchaToken,
    });
  }

  verifyResetPassword(mobilePhoneNumber: string, otp: string) {
    return ApiHttp.post("/auth/password/reset/verify", {
      mobilePhoneNumber,
      otp,
    }).then((r) => this._processAuthResponse(r));
  }

  resetPasswordViaEmail(
    email: string,
    newPassword: string,
    recaptchaToken: string
  ) {
    return ApiHttp.post("/auth/admin/password/email/reset", {
      email,
      newPassword,
      recaptchaToken,
    });
  }

  verifyResetPasswordViaEmail(email: string, otp: string) {
    return ApiHttp.post("/auth/admin/password/email/reset/verify", {
      email,
      otp,
    }).then((r) => this._processAuthResponse(r));
  }

  changeMobilePhone(newMobilePhoneNumber: string) {
    return ApiHttp.post("/auth/mobile_phone/change", { newMobilePhoneNumber });
  }

  verifyChangeMobilePhone(newMobilePhoneNumber: string, otp: string) {
    return ApiHttp.post("/auth/mobile_phone/change/verify", {
      newMobilePhoneNumber,
      otp,
    }).then((r) => this._processAuthResponse(r));
  }

  changePassword(password: string, newPassword: string) {
    let data = { password: password, newPassword: newPassword };
    return ApiHttp.post("/auth/password/change", data);
  }

  startAccountDeletion() {
    return ApiHttp.post("/auth/delete");
  }

  verifyAccountDeletion(otp: string) {
    return ApiHttp.post("/auth/delete/verify", { otp }).then(() =>
      this.anonymousLogin()
    );
  }

  generateAuthTokenForDevice(userAgent: string) {
    return ApiHttp.post("/auth/authoriseUserAgent", { userAgent }).then(
      (response) => response.data.credentials
    );
  }

  setPushNotificationToken(token: string) {
    return ApiHttp.post(`/auth/device/token/${token}`, {
      token,
      platform: import.meta.env.VITE_CONTEXT,
    });
  }

  logOut() {
    return this.anonymousLogin();
  }

  logOutOfAllDevices() {
    return ApiHttp.post("/auth/revoke_all").then(() => this.anonymousLogin());
  }
}

export default new AuthService();
