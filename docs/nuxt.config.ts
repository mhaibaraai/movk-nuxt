import pkg from '../package.json'

export default defineNuxtConfig({
  extends: ['@movk/nuxt-docs'],

  modules: ['@movk/nuxt', '@nuxtjs/i18n'],

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

  routeRules: {
    '/docs': { redirect: '/docs/getting-started', prerender: false },
    '/docs/components': { redirect: '/docs/components/as-phone-number-input', prerender: false },
    '/docs/auto-form': { redirect: '/docs/auto-form/quickstart', prerender: false },
    '/docs/composables': { redirect: '/docs/composables/use-auto-form', prerender: false },
    '/en/docs': { redirect: '/en/docs/getting-started', prerender: false },
    '/en/docs/components': { redirect: '/en/docs/components/as-phone-number-input', prerender: false },
    '/en/docs/auto-form': { redirect: '/en/docs/auto-form/quickstart', prerender: false },
    '/en/docs/composables': { redirect: '/en/docs/composables/use-auto-form', prerender: false }
  },

  compatibilityDate: 'latest',

  vite: {
    optimizeDeps: {
      include: [
        '@internationalized/date',
        '@movk/core',
        '@tanstack/vue-table',
        'colortranslator',
        'json5',
        'maska/vue',
        'tailwind-variants',
        'tailwindcss/colors',
        'zod'
      ]
    }
  },

  aiChat: {
    model: 'alibaba/glm-5.1',
    models: [
      'alibaba/qwen3.7-plus',
      'alibaba/glm-5.1',
      'alibaba/deepseek-v3.2'
    ]
  },

  i18n: {
    defaultLocale: 'zh-CN',
    locales: [
      { code: 'zh-CN', name: '简体中文', file: 'zh-CN.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ]
  },

  llms: {
    domain: 'https://nuxt.mhaibaraai.cn',
    title: 'Movk Nuxt',
    description: '构建在 Nuxt UI 之上的 UI 工程套件 — Schema 驱动的 AutoForm（Zod v4）、功能完备的 DataTable、独立组件与 Composables。在 Nuxt 4 中获得含认证与进度追踪的 API 集成在内的完整能力；其 UI、表单、表格与主题亦可经 Vite 插件直接用于纯 Vue + Vite 项目（API 集成域仅 Nuxt）。',
    full: {
      title: 'Movk Nuxt — 构建在 Nuxt UI 之上的 UI 工程套件',
      description: '基于 Nuxt UI 与 Zod v4 构建的 UI 工程套件，提供两种使用方式。完整能力面向 Nuxt 4：AutoForm（Schema 驱动的自动表单，多控件类型、自定义控件、布局与条件渲染）、DataTable（基于 TanStack Table，覆盖数据列/特殊列/树形数据/行交互/外观定制/分页与加载更多）、API System（useApiFetch/useLazyApiFetch/useClientApiFetch 多端点·自动认证·业务状态码检查·数据解包·Toast；useUploadWithProgress/useDownloadWithProgress 进度监控）、Standalone Components（DatePicker、StarRating、PillGroup、SearchForm、Tree、WithCopy、ThemePicker 等）、Composables（useDateFormatter、useTheme、useMessageBox、useAutoForm 等）。其中 UI 层——独立组件、AutoForm、DataTable、主题与非服务端 Composables——另可经 @movk/nuxt/vite + @movk/nuxt/vue-plugin 在纯 Vue + Vite 项目中直接使用；API 集成域依赖 Nuxt 服务端运行时，仅 Nuxt 模式可用。'
    },
    notes: ['nuxt', 'nuxt4', 'vue', 'vite', 'vue-plugin', 'standalone-components', 'autoform', 'zod', 'zod-v4', 'schema-driven', 'data-table', 'table', 'tanstack-table', 'tree', 'api', 'fetch', 'auth', 'upload', 'download', 'progress', 'theme', 'message-box', 'ui-components', 'composables', 'nuxt-ui', 'vueuse', '纯 Vue + Vite 场景用 @movk/nuxt/vite 引入 UI/表单/表格/主题/非服务端 Composables；API 集成域（useApiFetch、上传下载、auth、toast）仅 Nuxt 模式可用']
  },

  mcp: {
    name: 'Movk Nuxt',
    browserRedirect: '/docs/getting-started/ai/mcp'
  },

  movk: {
    theme: { enabled: true },
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
  }
})
