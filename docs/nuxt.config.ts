import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  extends: ['@movk/nuxt-docs'],
  modules: [
    '../src/module',
    (_, nuxt) => {
      nuxt.hook('components:dirs', (dirs) => {
        dirs.unshift({ path: resolve('./app/components/content/examples'), pathPrefix: false, prefix: '', global: true })
      })
    }
  ],
  css: ['~/assets/css/main.css'],
  site: {
    name: 'Movk Nuxt',
    url: 'https://nuxt.mhaibaraai.cn'
  },
  routeRules: {
    '/docs': { redirect: '/docs/getting-started', prerender: false },
    '/docs/components': { redirect: '/docs/components/with-character-limit', prerender: false },
    '/docs/auto-form/field': { redirect: '/docs/auto-form/field/string', prerender: false },
    '/docs/auto-form/customization': { redirect: '/docs/auto-form/customization/collapsible', prerender: false },
    '/docs/composables': { redirect: '/docs/composables/use-auto-form', prerender: false },
    '/docs/examples': { redirect: '/docs/examples/auto-form', prerender: false }
  },
  compatibilityDate: 'latest',
  aiChat: {
    models: [
      'mistral/devstral-2',
      'kwaipilot/kat-coder-pro-v1',
      'openrouter/mistralai/devstral-2512:free',
      'openrouter/xiaomi/mimo-v2-flash:free'
    ]
  },
  llms: {
    domain: 'https://nuxt.mhaibaraai.cn',
    title: '@movk/nuxt',
    description: 'Movk Nuxt 是一个为 Nuxt 4 设计的模块化工程套件，提供 Schema 驱动的自动表单生成、API 集成系统、独立 UI 组件和通用工具函数。',
    full: {
      title: '@movk/nuxt - Nuxt 4 模块化工程套件',
      description: '基于 Nuxt 4 和 Nuxt UI 的模块化扩展库，提供 Schema 驱动的自动表单生成、API 请求与认证管理、常用 composables 工具等完整的表单与数据处理解决方案。采用分层架构设计，包含 Core Systems (AutoForm)、API System (useApiFetch, useApiAuth, useUploadWithProgress, useDownloadWithProgress)、Standalone Components (DatePicker, StarRating 等) 和 Composables (useDateFormatter 等)。'
    },
    notes: ['nuxt', 'nuxt4', 'autoform', 'zod', 'schema-driven', 'api', 'fetch', 'auth', 'upload', 'download', 'ui-components', 'composables']
  },
  mcp: {
    name: 'Movk Nuxt'
    // browserRedirect: '/docs/getting-started/ai/mcp'
  }
})
