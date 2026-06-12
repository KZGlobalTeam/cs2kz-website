import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setupStyleQuerySync } from './router/style-query-sync'

import ui from '@nuxt/ui/vue-plugin'

import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import zh from '@/locales/zh.json'
import ru from '@/locales/ru.json'
import { getPreferredLocale } from '@/utils/locale'

const i18n = createI18n({
  locale: getPreferredLocale(),
  messages: {
    en,
    ru,
    zh,
  },
})

const app = createApp(App)
const pinia = createPinia()

setupStyleQuerySync(router, pinia)

app.use(pinia)
app.use(router)
app.use(ui)
app.use(i18n)

app.mount('#app')
