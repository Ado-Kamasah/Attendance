/* Tailwind v4 + all design tokens are in main.css */
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createNotivue } from 'notivue'

const pinia   = createPinia()
const notivue = createNotivue(/* options */)

const app = createApp(App)
app.use(notivue)
app.use(pinia)
app.mount('#app')
