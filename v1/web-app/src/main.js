// Polyfills
import 'intersection-observer'
import 'url-polyfill'
import 'es6-map/implement'
import 'mdn-polyfills/Object.assign'
import 'mdn-polyfills/Object.values'
import 'mdn-polyfills/Object.entries'
import 'mdn-polyfills/Array.from'
import 'mdn-polyfills/Array.prototype.find'
import 'mdn-polyfills/Array.prototype.includes'
import 'mdn-polyfills/String.prototype.includes'
import 'mdn-polyfills/String.prototype.startsWith'
import 'mdn-polyfills/Element.prototype.closest'
import 'mdn-polyfills/Number.isInteger'
import Promise from 'promise-polyfill'
if (!window.Promise) window.Promise = Promise

import Vue from 'vue'
import PortalVue from 'portal-vue'
import VueYoutube from 'vue-youtube'
Vue.config.productionTip = false
Vue.use(PortalVue)
Vue.use(VueYoutube)

import setupInternalPackages from './setup'
setupInternalPackages(Vue)

import Router from './router'
import NandosI18n from 'nandos-i18n'

import Components from './components'
// Register our custom components with Vue
const componentPrefix = 'N'
Object.keys(Components).forEach(key => {
  Vue.component(`${componentPrefix}${key}`, Components[key])
})

// Expose app context helpers to views 
Object.defineProperty(Vue.prototype, '$isBrowserApp', {
  get () { return process.env.VUE_APP_CONTEXT == 'WEB' }
})

Object.defineProperty(Vue.prototype, '$isCordovaApp', {
  get () { return ['IOS', 'ANDROID', 'HUAWEI_ANDROID'].includes(process.env.VUE_APP_CONTEXT) }
})

function start() {
  new Vue({
    router: Router,
    i18n: NandosI18n.i18n,
    render: h => h(Components.App)
  }).$mount('#app')
}

if(window['cordova'])
  document.addEventListener('deviceready', start, false)
else
  start()