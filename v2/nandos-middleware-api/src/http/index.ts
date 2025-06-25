import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import Observable from "../util/observable";
import AuthService from "../service/auth-service";
import DeviceUuidService from "../service/device-uuid-service";
import { HTTP_ERROR_CODE, HTTP_HEADER } from '@nandos-types/http';
import ApiError from "src/model/api-error";

// Tracks number of request still processing
export const requests_in_flight = {
  length: 0
}

interface ObservableAxios extends AxiosInstance, Observable {
  // These types are taken from axios index.d.ts but modified
  // To match our response, since out interceptors.response returns response.data directly from AxiosResponse
  get<R = AxiosResponse, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  post<R = AxiosResponse, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  delete<R = AxiosResponse, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  put<R = AxiosResponse, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
};
const ApiHttp = Object.assign(new Observable(), Axios.create({
  baseURL: import.meta.env.VITE_API
})) as ObservableAxios;
// @ts-ignore - will be available in vite context
ApiHttp.defaults.headers.common[HTTP_HEADER.NANDOS_APP_VERSION] = import.meta.env.VITE_VERSION! || '';
ApiHttp.defaults.headers.common[HTTP_HEADER.NANDOS_APP_CONTEXT] = import.meta.env.VITE_CONTEXT! || '';
if(DeviceUuidService.uuid) ApiHttp.defaults.headers.common[HTTP_HEADER.NANDOS_DEVICE_ID] = DeviceUuidService.uuid;

let isOffline = false;
const TOKEN_MIN_VALIDITY_BEFORE_REFRESH = 3 * 60 * 1000; // 3 mins

/**
 * Make sure all outgoing requests have the user's credentials set in the request's header
 */

ApiHttp.interceptors.request.use(config => {
    if (!AuthService.getCredentials()) {
      let error: Error & Record<string, any> = new Error('No user credentials');
      error.response = {
        config,
        data: { 
          error: {code: HTTP_ERROR_CODE.AUTH_TOKEN_NO_TOKEN} 
        }
      };
      throw error;
    }

    if(AuthService.getTimeToTokenExpiration() < TOKEN_MIN_VALIDITY_BEFORE_REFRESH) {
      AuthService.refreshToken();
    }

    config.headers[HTTP_HEADER.NANDOS_AUTH] = AuthService.getCredentials()?.token;
    
    requests_in_flight.length++;

    return config;
});

type TApiErrorResult = { isApiError: true, throwable: ApiError } | { isApiError: false, throwable: any };

function getApiError(error: any): TApiErrorResult {
  // Our backend sets status = 'error' on the exception response object
  const responseData = error?.response?.data;
  if (responseData?.status === 'error') {
    return {
      isApiError: true,
      throwable: new ApiError(responseData.error.message, responseData.error)
    };
  }
  // not ours
  return {
    isApiError: false,
    throwable: error
  };
}

ApiHttp.interceptors.response.use(
    function(response) {
      appIsOnline()
      requests_in_flight.length--;
      return response.data;
    },

    function (error) {
      requests_in_flight.length--;

      if(error.message == 'Network Error' && !error.config.url.startsWith('/analytics/event')) {
        appIsOffline()
        return Promise.reject(error);
      }
      else {
        const { isApiError, throwable } = getApiError(error);
        const reason = (isApiError) ? throwable.error.code : '';
        /*
          If request failed due to an issue with the token, get a new token(anonymous), and then
          replay the original request.
        */
        switch (reason) {
          case HTTP_ERROR_CODE.AUTH_TOKEN_NO_TOKEN:
          case HTTP_ERROR_CODE.AUTH_TOKEN_EXPIRED:
          case HTTP_ERROR_CODE.AUTH_TOKEN_INVALID:
          case HTTP_ERROR_CODE.AUTH_TOKEN_USER_NOT_FOUND:
            requests_in_flight.length++;
            return AuthService.anonymousLogin()
              .then(() => {
                requests_in_flight.length--;
                // replay the request
                return ApiHttp.request(error.response.config)
              },
              (error) => {
                requests_in_flight.length--;
                const { throwable } = getApiError(error);
                return Promise.reject(throwable);
              });
          case HTTP_ERROR_CODE.UNSUPPORTED_VERSION:
            ApiHttp.notifyObservers(HTTP_ERROR_CODE.UNSUPPORTED_VERSION);
            return Promise.reject(throwable);
          default:
            return Promise.reject(throwable);
        }
      }
    }
);

function appIsOnline() {
  if(isOffline == true) {
    isOffline = false;
    ApiHttp.notifyObservers(HTTP_ERROR_CODE.CONNECTION_STATUS_ONLINE);
  }
}

function appIsOffline() {
  if(isOffline == false) {
    isOffline = true;
    ApiHttp.notifyObservers(HTTP_ERROR_CODE.CONNECTION_STATUS_OFFLINE);
  }
}

/**
 * Avoids multiple concurrent in-flight GET requests to the same URL.
 * 
 * Capture all GET requests, so that when duplicate requests are made, we can just return
 * the original request's promise.
 */
const in_flight_get_requests = new Map();
const _get = ApiHttp.get;

ApiHttp.get = function (url: string) {
  const key = url;

  if (in_flight_get_requests.has(key)) {
    return in_flight_get_requests.get(key);
  } 
  else {
    const request = _get(url);
    in_flight_get_requests.set(key, request);
    request.finally(() => in_flight_get_requests.delete(key));
    
    return request
  }
}

export function setDefaultHeader(key: string, value: any) {
  ApiHttp.defaults.headers.common[key] = value;
}

export { Axios }
export default ApiHttp;