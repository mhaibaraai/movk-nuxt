export default defineNuxtConfig({
  extends: ['@movk/nuxt-docs'],

  modules: ['@movk/nuxt'],

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

  css: ['~/assets/css/main.css'],

  site: {
    name: 'Movk Nuxt'
  },

  routeRules: {
    '/docs': { redirect: '/docs/getting-started', prerender: false },
    '/docs/components': { redirect: '/docs/components/as-phone-number-input', prerender: false },
    '/docs/auto-form': { redirect: '/docs/auto-form/quickstart', prerender: false },
    '/docs/composables': { redirect: '/docs/composables/use-auto-form', prerender: false }
  },

  compatibilityDate: 'latest',

  vite: {
    optimizeDeps: {
      include: [
        'tailwindcss/colors',
        'tailwind-variants',
        'json5',
        '@internationalized/date',
        'maska/vue'
      ]
    }
  },

  aiChat: {
    model: 'zai/glm-5.1',
    models: [
      'zai/glm-5.1',
      'openai/gpt-5.4-mini',
      'alibaba/qwen3.6-plus'
    ]
  },

  llms: {
    domain: 'https://nuxt.mhaibaraai.cn',
    title: 'Movk Nuxt',
    description: 'Nuxt 4 模块化工程套件 — 把表单、表格、API、主题与交互收敛为开箱即用的模块能力：Schema 驱动的 AutoForm、功能完备的 DataTable、带认证与进度追踪的 API 系统，以及独立组件与通用 Composables。',
    full: {
      title: 'Movk Nuxt — Nuxt 4 模块化工程套件',
      description: '基于 Nuxt UI 和 Zod v4 构建的 Nuxt 4 模块化工程套件，采用分层架构设计。Core Systems：AutoForm（Schema 驱动的自动表单生成，支持多种控件类型、自定义控件、布局与条件渲染）、DataTable（基于 TanStack Table 的数据表格，覆盖数据列/特殊列/树形数据/行交互/外观定制/分页与加载更多）。API System：useApiFetch/useLazyApiFetch/useClientApiFetch（多端点、自动认证、业务状态码检查、数据解包、Toast 提示）、useUploadWithProgress/useDownloadWithProgress（带进度监控的文件传输）。Standalone Components：DatePicker、StarRating、PillGroup、SearchForm、WithCopy、ThemePicker 等独立 UI 组件。Composables：useDateFormatter（国际化日期）、useTheme（主题读写与导出）、useMessageBox（命令式弹窗）、useAutoForm 等通用工具函数。'
    },
    notes: ['nuxt', 'nuxt4', 'autoform', 'zod', 'zod-v4', 'schema-driven', 'data-table', 'table', 'tanstack-table', 'api', 'fetch', 'auth', 'upload', 'download', 'progress', 'theme', 'message-box', 'ui-components', 'composables', 'nuxt-ui', 'vueuse']
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
