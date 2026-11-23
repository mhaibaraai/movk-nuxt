import pkg from '../package.json'

const chatModel = process.env.NUXT_PUBLIC_AI_CHAT_MODEL || 'cloudflare/@cf/qwen/qwen3.8-27b'
const localD1DatabaseId = '00000000-0000-0000-0000-000000000000'
const d1DatabaseId = process.env.CLOUDFLARE_D1_DATABASE_ID || localD1DatabaseId

function i18nRedirects(
  rules: Record<string, string>
): Record<string, { redirect: string, prerender: false }> {
  return Object.fromEntries(
    Object.entries(rules).flatMap(([from, to]) => [
      [from, { redirect: to, prerender: false as const }],
      [`/en${from}`, { redirect: `/en${to}`, prerender: false as const }]
    ])
  )
}

export default defineNuxtConfig({
  extends: ['@movk/nuxt-docs'],

  modules: [
    '../src/module',
    '@nuxtjs/i18n'
  ],

  $development: {
    site: {
      url: 'http://localhost:3000'
    }
  },

  $production: {
    site: {
      url: 'https://nuxt.mhaibaraai.cn'
    },
    content: {
      database: { type: 'd1', bindingName: 'DB' }
    },
    nitro: {
      preset: 'cloudflare_module',
      // Cloudflare merges matching headers. Keep Nuxt asset caching in public/_headers.
      routeRules: {
        '/_nuxt/**': { cache: { maxAge: 0 } },
        '/_nuxt/builds/**': { cache: { maxAge: 0 } },
        '/_nuxt/builds/meta/**': { cache: { maxAge: 0 } },
        '/_nuxt/fonts/**': { cache: { maxAge: 0 } }
      },
      cloudflare: {
        deployConfig: true,
        nodeCompat: true,
        wrangler: {
          d1_databases: [{
            binding: 'DB',
            database_name: 'movk-nuxt-content',
            database_id: d1DatabaseId
          }]
        }
      }
    },
    hooks: {
      'build:before'() {
        if (process.env.WORKERS_CI === '1' && d1DatabaseId === localD1DatabaseId) {
          throw new Error('Set CLOUDFLARE_D1_DATABASE_ID in Workers Builds before deploying.')
        }
      }
    },
    aiChat: {
      enabled: true
    }
  },

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  site: {
    name: 'Movk Nuxt'
  },

  runtimeConfig: {
    public: {
      version: pkg.version
    }
  },

  // 章节入口重定向；v2 按能力域重组文档，旧路由统一指向新位置
  // i18nRedirects 自动生成中英文双语对，每条规则只需维护一次
  routeRules: {
    ...i18nRedirects({
      '/docs': '/docs/getting-started',
      '/docs/components': '/docs/components/date-picker',
      '/docs/auto-form': '/docs/auto-form/quickstart',
      // 组件路由变更
      '/docs/components/search-form': '/docs/auto-form/search-form',
      '/docs/components/theme-picker': '/docs/getting-started/theme',
      // v1 已移除组件，统一指向迁移指南
      '/docs/components/as-phone-number-input': '/docs/getting-started/migration',
      '/docs/components/color-chooser': '/docs/getting-started/migration',
      '/docs/components/pill-group': '/docs/getting-started/migration',
      '/docs/components/popconfirm': '/docs/getting-started/migration',
      '/docs/components/slide-verify': '/docs/getting-started/migration',
      '/docs/components/with-clear': '/docs/getting-started/migration',
      '/docs/components/with-copy': '/docs/getting-started/migration',
      '/docs/components/with-character-limit': '/docs/getting-started/migration',
      '/docs/components/with-floating-label': '/docs/getting-started/migration',
      '/docs/components/with-password-toggle': '/docs/getting-started/migration',
      // composables 路由变更
      '/docs/composables': '/docs/getting-started/migration',
      '/docs/composables/use-auto-form': '/docs/auto-form/use-auto-form',
      '/docs/composables/use-date-formatter': '/docs/components/date-picker',
      '/docs/composables/use-theme': '/docs/getting-started/theme',
      '/docs/composables/use-message-box': '/docs/components/message-box',
      '/docs/composables/use-upload-with-progress': '/docs/api/upload-download',
      '/docs/composables/use-download-with-progress': '/docs/api/upload-download',
      '/docs/composables/use-api-stream': '/docs/api/stream',
      // api 路由变更
      '/docs/api/use-lazy-api-fetch': '/docs/api/use-api-fetch',
      '/docs/api/use-client-api-fetch': '/docs/api/use-api-fetch',
      '/docs/api/chat-transport': '/docs/api/stream',
      // auto-form 拆分页合并
      '/docs/auto-form/string': '/docs/auto-form/field-types',
      '/docs/auto-form/number': '/docs/auto-form/field-types',
      '/docs/auto-form/boolean': '/docs/auto-form/field-types',
      '/docs/auto-form/date': '/docs/auto-form/field-types',
      '/docs/auto-form/enum': '/docs/auto-form/field-types',
      '/docs/auto-form/file': '/docs/auto-form/field-types',
      '/docs/auto-form/object': '/docs/auto-form/object-array',
      '/docs/auto-form/array': '/docs/auto-form/object-array',
      '/docs/auto-form/metadata': '/docs/auto-form/metadata-layout',
      '/docs/auto-form/layout': '/docs/auto-form/metadata-layout',
      '/docs/auto-form/reactive': '/docs/auto-form/reactive-submit',
      '/docs/auto-form/submit': '/docs/auto-form/reactive-submit',
      // AI 子页合并
      '/docs/getting-started/ai/mcp': '/docs/getting-started/ai',
      '/docs/getting-started/ai/llms-txt': '/docs/getting-started/ai',
      '/docs/getting-started/ai/skills': '/docs/getting-started/ai'
    })
  },

  compatibilityDate: '2026-06-30',

  vite: {
    optimizeDeps: {
      include: [
        '@internationalized/date',
        '@movk/core',
        '@tanstack/vue-table',
        'json5',
        'tailwind-variants',
        'tailwindcss/colors',
        'zod'
      ]
    }
  },

  aiChat: {
    enabled: Boolean(process.env.AI_BASE_URL && process.env.AI_API_KEY),
    model: chatModel,
    models: [chatModel]
  },

  i18n: {
    defaultLocale: 'zh-CN',
    locales: [
      { code: 'zh-CN', name: '简体中文' },
      { code: 'en', name: 'English' }
    ]
  },

  llms: {
    domain: 'https://nuxt.mhaibaraai.cn',
    title: 'Movk Nuxt',
    description: '面向 Nuxt 与 Vue 的应用开发工具包，提供 Schema 驱动的表单、可配置的数据表格、独立组件和组合式函数，支持在 Nuxt 中接入 API。',
    full: {
      title: 'Movk Nuxt | Nuxt 与 Vue 应用开发工具包',
      description: 'Movk Nuxt 基于 Nuxt UI 提供可组合的应用开发能力。AutoForm 使用 Zod v4 Schema 定义表单控件、校验、布局和条件显示。DataTable 使用列配置组织数据，支持排序、行选择、树形数据和分页。日期选择器、树形组件、确认弹窗与主题工具可独立使用。Nuxt 4 项目还可通过 useApiFetch 系列配置请求端点、认证和响应处理，并追踪上传与下载进度。Vue + Vite 项目可通过 @movk/nuxt/vite 和 @movk/nuxt/vue-plugin 使用表单、表格、组件、主题和客户端组合式函数。'
    },
    notes: ['nuxt', 'nuxt4', 'vue', 'vite', 'vue-plugin', 'standalone-components', 'autoform', 'zod', 'zod-v4', 'schema-driven', 'data-table', 'table', 'tanstack-table', 'tree', 'api', 'fetch', 'auth', 'upload', 'download', 'progress', 'theme', 'message-box', 'ui-components', 'composables', 'nuxt-ui', 'vueuse', '纯 Vue + Vite 场景用 @movk/nuxt/vite 引入 UI/表单/表格/主题/非服务端 Composables；API 集成域（useApiFetch、上传下载、auth、toast）仅 Nuxt 模式可用']
  },

  mcp: {
    name: 'Movk Nuxt',
    browserRedirect: '/docs/getting-started/ai'
  },

  movk: {
    api: {
      enabled: true,
      endpoints: {
        default: { baseURL: '/api' },
        v2: { baseURL: '/api/demo/v2' }
      },
      auth: {
        enabled: true,
        sessionTokenPath: 'token',
        unauthorized: {
          redirect: false,
          clearSession: true
        }
      }
    }
  },

  movkNuxtDocs: {
    componentDocs: true
  }
})
