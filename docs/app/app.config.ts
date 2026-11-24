export default defineAppConfig({
  header: {
    nav: [
      { label: { 'zh-CN': '文档', 'en': 'Docs' }, to: '/docs/getting-started', activeMatch: '/docs' },
      { label: { 'zh-CN': '版本发布', 'en': 'Releases' }, to: '/releases' }
    ],
    mobileNav: [
      { label: { 'zh-CN': '快速开始', 'en': 'Quick Start' }, icon: 'i-lucide-rocket', to: '/docs/getting-started' },
      { label: { 'zh-CN': '表单', 'en': 'Forms' }, icon: 'i-lucide-square-pen', to: '/docs/auto-form' },
      { label: 'DataTable', icon: 'i-lucide-table', to: '/docs/data-table' },
      { label: 'API', icon: 'i-lucide-cloud', to: '/docs/api' },
      { label: 'Components', icon: 'i-lucide-box', to: '/docs/components' },
      { label: { 'zh-CN': '版本发布', 'en': 'Releases' }, icon: 'i-lucide-newspaper', to: '/releases' },
      { label: 'GitHub', icon: 'i-simple-icons-github', to: 'https://github.com/mhaibaraai/movk-nuxt', target: '_blank' as const }
    ]
  },
  docs: {
    categories: {
      components: [
        { id: 'feedback', title: { 'zh-CN': '反馈组件', 'en': 'Feedback' }, icon: 'i-lucide-message-square-dot' },
        { id: 'advanced', title: { 'zh-CN': '进阶组件', 'en': 'Advanced' }, icon: 'i-lucide-blocks' }
      ]
    }
  },
  aside: {
    filter: {
      enabled: true
    }
  },
  toaster: {
    position: 'top-center' as const,
    duration: 3000
  },
  aiChat: {
    faqQuestions: {
      'zh-CN': [
        {
          category: '使用方式',
          items: [
            '能在纯 Vue + Vite 项目里用 @movk/nuxt 吗？',
            'Vue 模式与 Nuxt 模式的能力边界在哪里？',
            'Vite 项目如何配置 movk 插件？'
          ]
        },
        {
          category: 'AutoForm',
          items: [
            '一份 Zod Schema 如何同时定义校验与 UI 配置？',
            '如何做跨字段联动与条件显示？',
            '如何用 Slot 或自定义控件替换字段渲染？'
          ]
        },
        {
          category: 'DataTable',
          items: [
            '选择 / 索引 / 展开等特殊列怎么声明？',
            '树形数据如何配置级联选择策略？',
            '客户端分页与服务端分页如何切换？'
          ]
        },
        {
          category: 'API 系统（Nuxt）',
          items: [
            '如何切换多端点并注入鉴权 token？',
            '响应如何自动从信封结构解包（dataKey）？',
            '上传 / 下载进度如何实时监控？'
          ]
        },
        {
          category: '组件',
          items: [
            'DatePicker 输出格式与预设如何配置？',
            'Tree 复选框级联与异步懒加载如何配置？',
            'SearchForm 如何按行数自动折叠？'
          ]
        },
        {
          category: 'Composables 与主题',
          items: [
            'useMessageBox 如何命令式 confirm / alert？',
            '如何避免主题切换时的 SSR 闪烁？',
            'useDateFormatter 如何解析、格式化与比较日期？'
          ]
        }
      ],
      'en': [
        {
          category: 'Usage',
          items: [
            'Can I use @movk/nuxt in a plain Vue + Vite project?',
            'What is the capability boundary between Vue mode and Nuxt mode?',
            'How do I configure the movk Vite plugin?'
          ]
        },
        {
          category: 'AutoForm',
          items: [
            'How does a single Zod Schema define both validation and UI config?',
            'How do I implement cross-field dependencies and conditional display?',
            'How do I replace field rendering with a Slot or custom control?'
          ]
        },
        {
          category: 'DataTable',
          items: [
            'How do I declare selection / index / expand and other special columns?',
            'How do I configure cascading selection strategy for tree data?',
            'How do I switch between client-side and server-side pagination?'
          ]
        },
        {
          category: 'API System (Nuxt)',
          items: [
            'How do I switch between multiple endpoints and inject auth tokens?',
            'How does response auto-unwrapping from an envelope (dataKey) work?',
            'How do I monitor upload / download progress in real time?'
          ]
        },
        {
          category: 'Components',
          items: [
            'How do I configure DatePicker output format and presets?',
            'How do I configure Tree checkbox cascading and async lazy loading?',
            'How does SearchForm auto-collapse based on row count?'
          ]
        },
        {
          category: 'Composables & Theme',
          items: [
            'How do I use useMessageBox imperatively for confirm / alert?',
            'How do I avoid SSR flash when switching themes?',
            'How do I parse, format, and compare date ranges with useDateFormatter?'
          ]
        }
      ]
    }
  },
  github: {
    rootDir: 'docs',
    commitPath: 'src/runtime',
    dateFormat: {
      options: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Shanghai'
      }
    }
  },
  ui: {
    collapsible: {
      slots: {
        content: 'space-y-4'
      }
    },
    form: {
      base: 'space-y-4 min-w-0 sm:min-w-md'
    },
    prose: {
      codeIcon: {
        source: 'i-lucide-file-code',
        example: 'i-lucide-app-window-mac'
      }
    }
  },
  toc: {
    bottom: {
      links: [
        {
          icon: 'i-lucide-message-circle-code',
          to: 'https://nuxt.mhaibaraai.cn/llms.txt',
          target: '_blank',
          label: 'Open LLMs'
        }
      ]
    }
  },
  footer: {
    credits: `Copyright © 2025 - ${new Date().getFullYear()} YiXuan - <span class="text-highlighted">MIT License</span>`,
    socials: [
      {
        'icon': 'i-simple-icons-nuxt',
        'to': 'https://nuxt.com/',
        'target': '_blank',
        'aria-label': 'Nuxt Website'
      },
      {
        'icon': 'i-lucide-mail',
        'to': 'mailto:hi@mhaibaraai.cn',
        'target': '_blank',
        'aria-label': 'YiXuan\'s Email'
      }
    ]
  }
})
