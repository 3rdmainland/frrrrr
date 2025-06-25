import http from 'nandos-middleware-api/http'
import { AUTH_SERVICE_SETTINGS } from 'nandos-middleware-api/service/auth-service'

export default function (Vue) {
  http.defaults.baseURL = process.env.VUE_APP_API.replace(/\/$/, '') // remove trailing slash
  AUTH_SERVICE_SETTINGS.localStorageKey = process.env.VUE_APP_LOCAL_STORAGE_CREDENTIALS_KEY
}