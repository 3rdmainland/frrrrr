import setupMiddlewareApi from './setup-middleware-api'
import setupI18n from './setup-i18n'
import setupCoreUi from './setup-core-ui'
import setupTracking from './setup-tracking'
import setupOrdering from './setup-ordering'

export default function (Vue) {
  setupMiddlewareApi(Vue)
  setupI18n(Vue)
  setupCoreUi(Vue)
  setupTracking(Vue)
  setupOrdering(Vue)
}