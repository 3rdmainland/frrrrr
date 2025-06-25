import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import router from '@/router'
import { IconProvider } from 'nandos-core-ui-v2'
import { i18n } from 'nandos-i18n-v2'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(IconProvider)
app.use(i18n)
app.mount('#app')
