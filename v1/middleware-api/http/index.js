import Observable from '../util/observable'
import Axios from 'axios'
import AuthService from '../service/auth-service'
import DeviceUuidService from '../service/device-uuid-service'

// Create a configured axios instance that also inherits from Observable
const ApiHttp = Object.assign(new Observable(), Axios.create())

ApiHttp.defaults.headers.common['Nandos-App-Version'] = process.env.VUE_APP_VERSION
ApiHttp.defaults.headers.common['Nandos-App-Context'] = process.env.VUE_APP_CONTEXT
if(DeviceUuidService.uuid)
  ApiHttp.defaults.headers.common['Nandos-Device-ID'] = DeviceUuidService.uuid

let isOffline = false
const TOKEN_MIN_VALIDITY_BEFORE_REFRESH = 3 * 60 * 1000; // 3 mins

/**
 * Make sure all outgoing requests have the user's credentials set in the request's header
 */
ApiHttp.interceptors.request.use(config => {
  if (!AuthService.getCredentials()) {

    let error = new Error('No user credentials');
    error.response = {
      config: config,
      data:{ error:{code: 'AUTH_TOKEN:NO_TOKEN'} }
    }

    throw error;
  }

  if(AuthService.getTimeToTokenExpiration() < TOKEN_MIN_VALIDITY_BEFORE_REFRESH) {
    AuthService.refreshToken();
  }

  config.headers['Nandos-Auth'] = AuthService.getCredentials().token
  requests_in_flight.length++;

  return config;
});

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
      try {
        var reason = error.response.data.error.code;
      } catch(e){}

      /*
        If request failed due to an issue with the token, get a new token(anonymous), and then
        replay the original request.
      */
      switch (reason) {
        case 'AUTH_TOKEN:NO_TOKEN':
        case 'AUTH_TOKEN:EXPIRED':
        case 'AUTH_TOKEN:INVALID':
        case 'AUTH_TOKEN:USER_NOT_FOUND':
          requests_in_flight.length++;
          return AuthService.anonymousLogin()
            .then(() => {
              requests_in_flight.length--;
              // replay the request
              return ApiHttp.request(error.response.config)
            },
            (error) => {
              requests_in_flight.length--;
              //appIsOffline();
              return Promise.reject(error);
            })
          break;

        case 'UNSUPPORTED_VERSION':
          ApiHttp.notifyObservers('UNSUPPORTED_VERSION')
          return Promise.reject(error);
          break;

        default:
          return Promise.reject(error.response ? error.response.data.error : error);
          break;
      }
    }
  }
);

function appIsOnline() {
  if(isOffline == true) {
    isOffline = false
    ApiHttp.notifyObservers('CONNECTION_STATUS_ONLINE')
  }
}

function appIsOffline() {
  if(isOffline == false) {
    isOffline = true
    ApiHttp.notifyObservers('CONNECTION_STATUS_OFFLINE')
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
ApiHttp.get = function (url) {
  let key = url;

  if (in_flight_get_requests.has(key)) {
    return in_flight_get_requests.get(key);
  } else {
    let request = _get(...arguments);
    in_flight_get_requests.set(key, request)

    request.finally(() => in_flight_get_requests.clear(key))

    return request
  }
}

export { Axios }

export const requests_in_flight = {
  length: 0
}

export function setDefaultHeader(key, value) {
  ApiHttp.defaults.headers.common[key] = value
}

export default ApiHttp