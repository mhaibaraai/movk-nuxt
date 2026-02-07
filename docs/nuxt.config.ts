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

  $development: {
    site: {
      name: 'Movk Nuxt',
      url: 'http://localhost:3000'
    }
  },

  $production: {
    site: {
      url: 'https://nuxt.mhaibaraai.cn'
    }
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/docs': { redirect: '/docs/getting-started', prerender: false },
    '/docs/components': { redirect: '/docs/components/with-character-limit', prerender: false },
    '/docs/auto-form/field': { redirect: '/docs/auto-form/field/string', prerender: false },
    '/docs/auto-form/customization': { redirect: '/docs/auto-form/customization/collapsible', prerender: false },
    '/docs/composables': { redirect: '/docs/composables/use-auto-form', prerender: false },
    '/docs/examples': { redirect: '/docs/examples/auto-form', prerender: false },
    '/docs/best-practices': { redirect: '/docs/best-practices/project-structure', prerender: false }
  },

  compatibilityDate: 'latest',

  aiChat: {
    model: 'mistral/devstral-3b',
    models: [
      'mistral/devstral-2',
      'openrouter/xiaomi/mimo-v2-flash:free',
      'openrouter/z-ai/glm-4.5-air:free',
      'mistral/ministral-3b'
    ]
  },

  llms: {
    domain: 'https://nuxt.mhaibaraai.cn',
    title: 'Movk Nuxt',
    description: 'Nuxt 4 模块化工程套件 — 基于 Zod v4 的 Schema 驱动自动表单、带认证与进度追踪的 API 集成系统、10+ 独立 UI 组件和通用 Composables。',
    full: {
      title: 'Movk Nuxt — Nuxt 4 模块化工程套件',
      description: '基于 Nuxt UI 和 Zod v4 构建的 Nuxt 4 模块化工程套件。采用分层架构设计：Core Systems (AutoForm — Schema 驱动的自动表单生成，支持 15+ 控件类型)、API System (useApiFetch/useLazyApiFetch/useClientApiFetch — 多端点、自动认证、业务状态码检查、Toast 提示；useUploadWithProgress/useDownloadWithProgress — 带进度监控的文件传输)、Standalone Components (DatePicker、StarRating、WithCopy 等 10+ 个独立 UI 组件)、Composables (useDateFormatter 等通用工具函数)。'
    },
    notes: ['nuxt', 'nuxt4', 'autoform', 'zod', 'zod-v4', 'schema-driven', 'api', 'fetch', 'auth', 'upload', 'download', 'progress', 'ui-components', 'composables', 'nuxt-ui', 'vueuse']
  },

  mcp: {
    name: 'Movk Nuxt',
    browserRedirect: '/docs/getting-started/ai/mcp'
  }
})
