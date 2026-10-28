import pkg from '../package.json'

export default defineNuxtConfig({
  extends: ['@movk/nuxt-docs'],

  modules: [
    '../src/module',
    '@nuxtjs/i18n',
    '@vercel/analytics',
    '@vercel/speed-insights'
  ],

  $development: {
    site: {
      url: 'http://localhost:3000'
    }
  },

  $production: {
    site: {
      url: 'https://nuxt.mhaibaraai.cn'
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
  routeRules: {
    '/docs': { redirect: '/docs/getting-started', prerender: false },
    '/docs/components': { redirect: '/docs/components/date-picker', prerender: false },
    '/docs/auto-form': { redirect: '/docs/auto-form/quickstart', prerender: false },
    '/docs/components/search-form': { redirect: '/docs/auto-form/search-form', prerender: false },
    '/docs/components/theme-picker': { redirect: '/docs/getting-started/theme', prerender: false },
    '/docs/components/as-phone-number-input': { redirect: '/docs/getting-started/migration', prerender: false },
    '/docs/components/color-chooser': { redirect: '/docs/getting-started/migration', prerender: false },
    '/docs/components/pill-group': { redirect: '/docs/getting-started/migration', prerender: false },
    '/docs/components/popconfirm': { redirect: '/docs/getting-started/migration', prerender: false },
    '/docs/components/slide-verify': { redirect: '/docs/getting-started/migration', prerender: false },
    '/docs/components/with-clear': { redirect: '/docs/getting-started/migration', prerender: false },
    '/docs/components/with-copy': { redirect: '/docs/getting-started/migration', prerender: false },
    '/docs/components/with-character-limit': { redirect: '/docs/getting-started/migration', prerender: false },
    '/docs/components/with-floating-label': { redirect: '/docs/getting-started/migration', prerender: false },
    '/docs/components/with-password-toggle': { redirect: '/docs/getting-started/migration', prerender: false },
    '/docs/composables': { redirect: '/docs/getting-started/migration', prerender: false },
    '/docs/composables/use-auto-form': { redirect: '/docs/auto-form/use-auto-form', prerender: false },
    '/docs/composables/use-date-formatter': { redirect: '/docs/components/date-picker', prerender: false },
    '/docs/composables/use-theme': { redirect: '/docs/getting-started/theme', prerender: false },
    '/docs/composables/use-message-box': { redirect: '/docs/components/message-box', prerender: false },
    '/docs/composables/use-upload-with-progress': { redirect: '/docs/api/upload-download', prerender: false },
    '/docs/composables/use-download-with-progress': { redirect: '/docs/api/upload-download', prerender: false },
    '/docs/composables/use-api-stream': { redirect: '/docs/api/stream', prerender: false },
    '/docs/api/use-lazy-api-fetch': { redirect: '/docs/api/use-api-fetch', prerender: false },
    '/docs/api/use-client-api-fetch': { redirect: '/docs/api/use-api-fetch', prerender: false },
    '/docs/api/chat-transport': { redirect: '/docs/api/stream', prerender: false },
    '/docs/auto-form/string': { redirect: '/docs/auto-form/field-types', prerender: false },
    '/docs/auto-form/number': { redirect: '/docs/auto-form/field-types', prerender: false },
    '/docs/auto-form/boolean': { redirect: '/docs/auto-form/field-types', prerender: false },
    '/docs/auto-form/date': { redirect: '/docs/auto-form/field-types', prerender: false },
    '/docs/auto-form/enum': { redirect: '/docs/auto-form/field-types', prerender: false },
    '/docs/auto-form/file': { redirect: '/docs/auto-form/field-types', prerender: false },
    '/docs/auto-form/object': { redirect: '/docs/auto-form/object-array', prerender: false },
    '/docs/auto-form/array': { redirect: '/docs/auto-form/object-array', prerender: false },
    '/docs/auto-form/metadata': { redirect: '/docs/auto-form/metadata-layout', prerender: false },
    '/docs/auto-form/layout': { redirect: '/docs/auto-form/metadata-layout', prerender: false },
    '/docs/auto-form/reactive': { redirect: '/docs/auto-form/reactive-submit', prerender: false },
    '/docs/auto-form/submit': { redirect: '/docs/auto-form/reactive-submit', prerender: false },
    '/docs/getting-started/ai/mcp': { redirect: '/docs/getting-started/ai', prerender: false },
    '/docs/getting-started/ai/llms-txt': { redirect: '/docs/getting-started/ai', prerender: false },
    '/docs/getting-started/ai/skills': { redirect: '/docs/getting-started/ai', prerender: false },
    '/en/docs': { redirect: '/en/docs/getting-started', prerender: false },
    '/en/docs/components': { redirect: '/en/docs/components/date-picker', prerender: false },
    '/en/docs/auto-form': { redirect: '/en/docs/auto-form/quickstart', prerender: false },
    '/en/docs/components/search-form': { redirect: '/en/docs/auto-form/search-form', prerender: false },
    '/en/docs/components/theme-picker': { redirect: '/en/docs/getting-started/theme', prerender: false },
    '/en/docs/components/as-phone-number-input': { redirect: '/en/docs/getting-started/migration', prerender: false },
    '/en/docs/components/color-chooser': { redirect: '/en/docs/getting-started/migration', prerender: false },
    '/en/docs/components/pill-group': { redirect: '/en/docs/getting-started/migration', prerender: false },
    '/en/docs/components/popconfirm': { redirect: '/en/docs/getting-started/migration', prerender: false },
    '/en/docs/components/slide-verify': { redirect: '/en/docs/getting-started/migration', prerender: false },
    '/en/docs/components/with-clear': { redirect: '/en/docs/getting-started/migration', prerender: false },
    '/en/docs/components/with-copy': { redirect: '/en/docs/getting-started/migration', prerender: false },
    '/en/docs/components/with-character-limit': { redirect: '/en/docs/getting-started/migration', prerender: false },
    '/en/docs/components/with-floating-label': { redirect: '/en/docs/getting-started/migration', prerender: false },
    '/en/docs/components/with-password-toggle': { redirect: '/en/docs/getting-started/migration', prerender: false },
    '/en/docs/composables': { redirect: '/en/docs/getting-started/migration', prerender: false },
    '/en/docs/composables/use-auto-form': { redirect: '/en/docs/auto-form/use-auto-form', prerender: false },
    '/en/docs/composables/use-date-formatter': { redirect: '/en/docs/components/date-picker', prerender: false },
    '/en/docs/composables/use-theme': { redirect: '/en/docs/getting-started/theme', prerender: false },
    '/en/docs/composables/use-message-box': { redirect: '/en/docs/components/message-box', prerender: false },
    '/en/docs/composables/use-upload-with-progress': { redirect: '/en/docs/api/upload-download', prerender: false },
    '/en/docs/composables/use-download-with-progress': { redirect: '/en/docs/api/upload-download', prerender: false },
    '/en/docs/composables/use-api-stream': { redirect: '/en/docs/api/stream', prerender: false },
    '/en/docs/api/use-lazy-api-fetch': { redirect: '/en/docs/api/use-api-fetch', prerender: false },
    '/en/docs/api/use-client-api-fetch': { redirect: '/en/docs/api/use-api-fetch', prerender: false },
    '/en/docs/api/chat-transport': { redirect: '/en/docs/api/stream', prerender: false },
    '/en/docs/auto-form/string': { redirect: '/en/docs/auto-form/field-types', prerender: false },
    '/en/docs/auto-form/number': { redirect: '/en/docs/auto-form/field-types', prerender: false },
    '/en/docs/auto-form/boolean': { redirect: '/en/docs/auto-form/field-types', prerender: false },
    '/en/docs/auto-form/date': { redirect: '/en/docs/auto-form/field-types', prerender: false },
    '/en/docs/auto-form/enum': { redirect: '/en/docs/auto-form/field-types', prerender: false },
    '/en/docs/auto-form/file': { redirect: '/en/docs/auto-form/field-types', prerender: false },
    '/en/docs/auto-form/object': { redirect: '/en/docs/auto-form/object-array', prerender: false },
    '/en/docs/auto-form/array': { redirect: '/en/docs/auto-form/object-array', prerender: false },
    '/en/docs/auto-form/metadata': { redirect: '/en/docs/auto-form/metadata-layout', prerender: false },
    '/en/docs/auto-form/layout': { redirect: '/en/docs/auto-form/metadata-layout', prerender: false },
    '/en/docs/auto-form/reactive': { redirect: '/en/docs/auto-form/reactive-submit', prerender: false },
    '/en/docs/auto-form/submit': { redirect: '/en/docs/auto-form/reactive-submit', prerender: false },
    '/en/docs/getting-started/ai/mcp': { redirect: '/en/docs/getting-started/ai', prerender: false },
    '/en/docs/getting-started/ai/llms-txt': { redirect: '/en/docs/getting-started/ai', prerender: false },
    '/en/docs/getting-started/ai/skills': { redirect: '/en/docs/getting-started/ai', prerender: false }
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
    model: 'alibaba/qwen3.8-27b',
    models: [
      'alibaba/qwen3.8-27b',
      'deepseek/deepseek-v4-pro-0813'
    ]
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
    description: '构建在 Nuxt UI 之上的 UI 工程套件 — Schema 驱动的 AutoForm（Zod v4）、功能完备的 DataTable、独立组件与 Composables。在 Nuxt 4 中获得含认证与进度追踪的 API 集成在内的完整能力；其 UI、表单、表格与主题亦可经 Vite 插件直接用于纯 Vue + Vite 项目（API 集成域仅 Nuxt）。',
    full: {
      title: 'Movk Nuxt — 构建在 Nuxt UI 之上的 UI 工程套件',
      description: '基于 Nuxt UI 与 Zod v4 构建的 UI 工程套件，提供两种使用方式。完整能力面向 Nuxt 4：AutoForm（Schema 驱动的自动表单，多控件类型、自定义控件、布局与条件渲染）、DataTable（基于 TanStack Table，覆盖数据列/特殊列/树形数据/行交互/外观定制/分页与加载更多）、API System（useApiFetch/useLazyApiFetch/useClientApiFetch 多端点·自动认证·业务状态码检查·数据解包·Toast；useUploadWithProgress/useDownloadWithProgress 进度监控）、Standalone Components（DatePicker、SearchForm、Tree、MessageBox、ThemePicker）、Composables（useDateFormatter、useTheme、useMessageBox、useAutoForm 等）。其中 UI 层——独立组件、AutoForm、DataTable、主题与非服务端 Composables——另可经 @movk/nuxt/vite + @movk/nuxt/vue-plugin 在纯 Vue + Vite 项目中直接使用；API 集成域依赖 Nuxt 服务端运行时，仅 Nuxt 模式可用。'
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
