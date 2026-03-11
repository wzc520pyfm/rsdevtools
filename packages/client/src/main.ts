import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'sessions',
      component: () => import('./pages/Sessions.vue'),
    },
    {
      path: '/compare/:ids',
      name: 'compare',
      component: () => import('./pages/Compare.vue'),
    },
    {
      path: '/session/:id',
      component: () => import('./pages/SessionLayout.vue'),
      children: [
        { path: '', name: 'overview', component: () => import('./pages/Overview.vue') },
        { path: 'modules', name: 'modules', component: () => import('./pages/Modules.vue') },
        { path: 'chunks', name: 'chunks', component: () => import('./pages/Chunks.vue') },
        { path: 'assets', name: 'assets', component: () => import('./pages/Assets.vue') },
        { path: 'graph', name: 'graph', component: () => import('./pages/Graph.vue') },
        { path: 'plugins', name: 'plugins', component: () => import('./pages/Plugins.vue') },
        { path: 'packages', name: 'packages', component: () => import('./pages/Packages.vue') },
        { path: 'errors', name: 'errors', component: () => import('./pages/Errors.vue') },
        { path: 'terminal', name: 'terminal', component: () => import('./pages/Terminal.vue') },
      ],
    },
  ],
})

const app = createApp(App)
app.use(router)
app.mount('#app')
