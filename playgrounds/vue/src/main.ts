import './assets/css/main.css'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import movkVuePlugin from '@movk/nuxt/vue-plugin'
import App from './App.vue'

// 复用 Nuxt playground 的演示页；负向模式排除 API 域页（依赖 useApiFetch / 上传下载，纯 Vite 不支持，
// 必须在 glob 层排除——import.meta.glob 会为每个匹配文件生成 import()，仅过滤路由挡不住打包）
const playPages = import.meta.glob([
  '../../play/app/pages/**/*.vue',
  '!../../play/app/pages/api/**',
  '!../../play/app/pages/data-table/pagination.vue',
  '!../../play/app/pages/composables/use-upload-progress.vue',
  '!../../play/app/pages/composables/use-download-progress.vue'
])
// 本地 vue 专属页（同路径覆盖，如客户端分页）
const localPages = import.meta.glob('./pages/**/*.vue')

function toRoutePath(file: string): string {
  const name = file.match(/\/pages(.*)\.vue$/)![1].toLowerCase()
  return name === '/index' ? '/' : name
}

const routeMap = new Map<string, RouteRecordRaw>()
for (const [file, component] of Object.entries(playPages)) {
  const path = toRoutePath(file)
  routeMap.set(path, { path, component })
}
for (const [file, component] of Object.entries(localPages)) {
  const path = toRoutePath(file)
  routeMap.set(path, { path, component })
}

const router = createRouter({
  routes: [...routeMap.values()],
  history: createWebHistory()
})

createApp(App)
  .use(router)
  .use(movkVuePlugin)
  .mount('#app')
