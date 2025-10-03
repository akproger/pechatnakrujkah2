import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomePage from './components/pages/HomePage.vue'
import GridsPage from './components/pages/GridsPage.vue'
import StickerManiaPage from './components/pages/StickerManiaPage.vue'
import MugComicPage from './components/pages/MugComicPage.vue'

// Bootstrap CSS и JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Роутинг
const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/grids', name: 'Grids', component: GridsPage },
  { path: '/sticker-mania', name: 'StickerMania', component: StickerManiaPage },
  { path: '/mug-comic', name: 'MugComic', component: MugComicPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Создание приложения
const app = createApp(App)
app.use(router)
app.mount('#app')
