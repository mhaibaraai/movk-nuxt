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
    '/docs': { redirect: { to: '/docs/getting-started', statusCode: 301 }, prerender: false },
    '/docs/components': { redirect: { to: '/docs/components/date-picker', statusCode: 301 }, prerender: false },
    '/docs/auto-form': { redirect: { to: '/docs/auto-form/quickstart', statusCode: 301 }, prerender: false },
    '/docs/components/search-form': { redirect: { to: '/docs/auto-form/search-form', statusCode: 301 }, prerender: false },
    '/docs/components/theme-picker': { redirect: { to: '/docs/getting-started/theme', statusCode: 301 }, prerender: false },
    '/docs/components/as-phone-number-input': { redirect: { to: '/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/docs/components/color-chooser': { redirect: { to: '/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/docs/components/pill-group': { redirect: { to: '/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/docs/components/popconfirm': { redirect: { to: '/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/docs/components/slide-verify': { redirect: { to: '/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/docs/components/with-clear': { redirect: { to: '/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/docs/components/with-copy': { redirect: { to: '/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/docs/components/with-character-limit': { redirect: { to: '/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/docs/components/with-floating-label': { redirect: { to: '/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/docs/components/with-password-toggle': { redirect: { to: '/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/docs/composables': { redirect: { to: '/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/docs/composables/use-auto-form': { redirect: { to: '/docs/auto-form/use-auto-form', statusCode: 301 }, prerender: false },
    '/docs/composables/use-date-formatter': { redirect: { to: '/docs/components/date-picker', statusCode: 301 }, prerender: false },
    '/docs/composables/use-theme': { redirect: { to: '/docs/getting-started/theme', statusCode: 301 }, prerender: false },
    '/docs/composables/use-message-box': { redirect: { to: '/docs/components/message-box', statusCode: 301 }, prerender: false },
    '/docs/composables/use-upload-with-progress': { redirect: { to: '/docs/api/upload-download', statusCode: 301 }, prerender: false },
    '/docs/composables/use-download-with-progress': { redirect: { to: '/docs/api/upload-download', statusCode: 301 }, prerender: false },
    '/docs/composables/use-api-stream': { redirect: { to: '/docs/api/stream', statusCode: 301 }, prerender: false },
    '/docs/api/use-lazy-api-fetch': { redirect: { to: '/docs/api/use-api-fetch', statusCode: 301 }, prerender: false },
    '/docs/api/use-client-api-fetch': { redirect: { to: '/docs/api/use-api-fetch', statusCode: 301 }, prerender: false },
    '/docs/api/chat-transport': { redirect: { to: '/docs/api/stream', statusCode: 301 }, prerender: false },
    '/docs/auto-form/string': { redirect: { to: '/docs/auto-form/field-types', statusCode: 301 }, prerender: false },
    '/docs/auto-form/number': { redirect: { to: '/docs/auto-form/field-types', statusCode: 301 }, prerender: false },
    '/docs/auto-form/boolean': { redirect: { to: '/docs/auto-form/field-types', statusCode: 301 }, prerender: false },
    '/docs/auto-form/date': { redirect: { to: '/docs/auto-form/field-types', statusCode: 301 }, prerender: false },
    '/docs/auto-form/enum': { redirect: { to: '/docs/auto-form/field-types', statusCode: 301 }, prerender: false },
    '/docs/auto-form/file': { redirect: { to: '/docs/auto-form/field-types', statusCode: 301 }, prerender: false },
    '/docs/auto-form/object': { redirect: { to: '/docs/auto-form/object-array', statusCode: 301 }, prerender: false },
    '/docs/auto-form/array': { redirect: { to: '/docs/auto-form/object-array', statusCode: 301 }, prerender: false },
    '/docs/auto-form/metadata': { redirect: { to: '/docs/auto-form/metadata-layout', statusCode: 301 }, prerender: false },
    '/docs/auto-form/layout': { redirect: { to: '/docs/auto-form/metadata-layout', statusCode: 301 }, prerender: false },
    '/docs/auto-form/reactive': { redirect: { to: '/docs/auto-form/reactive-submit', statusCode: 301 }, prerender: false },
    '/docs/auto-form/submit': { redirect: { to: '/docs/auto-form/reactive-submit', statusCode: 301 }, prerender: false },
    '/docs/getting-started/ai/mcp': { redirect: { to: '/docs/getting-started/ai', statusCode: 301 }, prerender: false },
    '/docs/getting-started/ai/llms-txt': { redirect: { to: '/docs/getting-started/ai', statusCode: 301 }, prerender: false },
    '/docs/getting-started/ai/skills': { redirect: { to: '/docs/getting-started/ai', statusCode: 301 }, prerender: false },
    '/en/docs': { redirect: { to: '/en/docs/getting-started', statusCode: 301 }, prerender: false },
    '/en/docs/components': { redirect: { to: '/en/docs/components/date-picker', statusCode: 301 }, prerender: false },
    '/en/docs/auto-form': { redirect: { to: '/en/docs/auto-form/quickstart', statusCode: 301 }, prerender: false },
    '/en/docs/components/search-form': { redirect: { to: '/en/docs/auto-form/search-form', statusCode: 301 }, prerender: false },
    '/en/docs/components/theme-picker': { redirect: { to: '/en/docs/getting-started/theme', statusCode: 301 }, prerender: false },
    '/en/docs/components/as-phone-number-input': { redirect: { to: '/en/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/en/docs/components/color-chooser': { redirect: { to: '/en/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/en/docs/components/pill-group': { redirect: { to: '/en/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/en/docs/components/popconfirm': { redirect: { to: '/en/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/en/docs/components/slide-verify': { redirect: { to: '/en/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/en/docs/components/with-clear': { redirect: { to: '/en/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/en/docs/components/with-copy': { redirect: { to: '/en/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/en/docs/components/with-character-limit': { redirect: { to: '/en/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/en/docs/components/with-floating-label': { redirect: { to: '/en/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/en/docs/components/with-password-toggle': { redirect: { to: '/en/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/en/docs/composables': { redirect: { to: '/en/docs/getting-started/migration', statusCode: 301 }, prerender: false },
    '/en/docs/composables/use-auto-form': { redirect: { to: '/en/docs/auto-form/use-auto-form', statusCode: 301 }, prerender: false },
    '/en/docs/composables/use-date-formatter': { redirect: { to: '/en/docs/components/date-picker', statusCode: 301 }, prerender: false },
    '/en/docs/composables/use-theme': { redirect: { to: '/en/docs/getting-started/theme', statusCode: 301 }, prerender: false },
    '/en/docs/composables/use-message-box': { redirect: { to: '/en/docs/components/message-box', statusCode: 301 }, prerender: false },
    '/en/docs/composables/use-upload-with-progress': { redirect: { to: '/en/docs/api/upload-download', statusCode: 301 }, prerender: false },
    '/en/docs/composables/use-download-with-progress': { redirect: { to: '/en/docs/api/upload-download', statusCode: 301 }, prerender: false },
    '/en/docs/composables/use-api-stream': { redirect: { to: '/en/docs/api/stream', statusCode: 301 }, prerender: false },
    '/en/docs/api/use-lazy-api-fetch': { redirect: { to: '/en/docs/api/use-api-fetch', statusCode: 301 }, prerender: false },
    '/en/docs/api/use-client-api-fetch': { redirect: { to: '/en/docs/api/use-api-fetch', statusCode: 301 }, prerender: false },
    '/en/docs/api/chat-transport': { redirect: { to: '/en/docs/api/stream', statusCode: 301 }, prerender: false },
    '/en/docs/auto-form/string': { redirect: { to: '/en/docs/auto-form/field-types', statusCode: 301 }, prerender: false },
    '/en/docs/auto-form/number': { redirect: { to: '/en/docs/auto-form/field-types', statusCode: 301 }, prerender: false },
    '/en/docs/auto-form/boolean': { redirect: { to: '/en/docs/auto-form/field-types', statusCode: 301 }, prerender: false },
    '/en/docs/auto-form/date': { redirect: { to: '/en/docs/auto-form/field-types', statusCode: 301 }, prerender: false },
    '/en/docs/auto-form/enum': { redirect: { to: '/en/docs/auto-form/field-types', statusCode: 301 }, prerender: false },
    '/en/docs/auto-form/file': { redirect: { to: '/en/docs/auto-form/field-types', statusCode: 301 }, prerender: false },
    '/en/docs/auto-form/object': { redirect: { to: '/en/docs/auto-form/object-array', statusCode: 301 }, prerender: false },
    '/en/docs/auto-form/array': { redirect: { to: '/en/docs/auto-form/object-array', statusCode: 301 }, prerender: false },
    '/en/docs/auto-form/metadata': { redirect: { to: '/en/docs/auto-form/metadata-layout', statusCode: 301 }, prerender: false },
    '/en/docs/auto-form/layout': { redirect: { to: '/en/docs/auto-form/metadata-layout', statusCode: 301 }, prerender: false },
    '/en/docs/auto-form/reactive': { redirect: { to: '/en/docs/auto-form/reactive-submit', statusCode: 301 }, prerender: false },
    '/en/docs/auto-form/submit': { redirect: { to: '/en/docs/auto-form/reactive-submit', statusCode: 301 }, prerender: false },
    '/en/docs/getting-started/ai/mcp': { redirect: { to: '/en/docs/getting-started/ai', statusCode: 301 }, prerender: false },
    '/en/docs/getting-started/ai/llms-txt': { redirect: { to: '/en/docs/getting-started/ai', statusCode: 301 }, prerender: false },
    '/en/docs/getting-started/ai/skills': { redirect: { to: '/en/docs/getting-started/ai', statusCode: 301 }, prerender: false }
  },

  compatibilityDate: '2026-06-30',

  // 本地 link 的 Layer 位于 workspace 外，内联 Prettier 避免产物保留跨仓库相对导入。
  nitro: {
    externals: {
      inline: [/[/\\]prettier[/\\]/]
    }
  },

  vite: {
    optimizeDeps: {
      include: [
        '@internationalized/date',
        '@movk/core',
        '@tanstack/vue-table',
        'json5',
        'tailwindcss/colors',
        'zod'
      ]
    }
  },

  // 本地 link 的 Layer 使用本站 Content 副本，确保服务端查询读取本站生成的集合类型。
  typescript: {
    hoist: ['@nuxt/content/server']
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
