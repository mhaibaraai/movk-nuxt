export default defineAppConfig({
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
            'Vue 模式下哪些能力可用、哪些仅限 Nuxt？',
            '为什么 API 集成域（useApiFetch、上传下载）只在 Nuxt 可用？',
            'Vite 项目如何配置 movk 插件与 vue-plugin？'
          ]
        },
        {
          category: 'AutoForm',
          items: [
            '一份 Zod Schema 如何同时定义校验与 UI 配置？',
            '数组与嵌套对象字段如何渲染并动态增删？',
            '如何用 Slot 或自定义控件替换字段渲染？',
            '如何做跨字段联动与条件显示？'
          ]
        },
        {
          category: 'DataTable',
          items: [
            '客户端分页与服务端分页（rowCount / pageCount）如何切换？',
            '树形数据如何配置级联选择策略？',
            '列如何固定、拖拽列宽、截断 + Tooltip？',
            '选择 / 索引 / 展开 / 操作等特殊列怎么声明？'
          ]
        },
        {
          category: 'API 系统（Nuxt）',
          items: [
            '响应如何自动从信封结构解包（dataKey）？',
            '如何切换多端点并注入鉴权 token？',
            '如何按业务状态码判定成败并提示 Toast？',
            '上传 / 下载进度如何实时回调？'
          ]
        },
        {
          category: '组件',
          items: [
            'SearchForm 如何按行数自动折叠？',
            'PillGroup 如何做多选与字段映射？',
            'DatePicker 输出格式与预设如何配置？',
            'With* 输入增强（清除/复制/字数/密码）怎么用？',
            'Tree 复选框级联、父子策略与异步懒加载如何配置？'
          ]
        },
        {
          category: 'Composables 与主题',
          items: [
            '如何避免主题切换时的 SSR 闪烁（Nuxt）？',
            '如何导出当前主题的 CSS 变量？',
            'useMessageBox 如何命令式 confirm / alert？',
            'useDateFormatter 如何解析、格式化与比较日期范围？'
          ]
        }
      ],
      'en': [
        {
          category: 'Usage',
          items: [
            'Can I use @movk/nuxt in a plain Vue + Vite project?',
            'Which capabilities are available in Vue mode vs. Nuxt-only?',
            'Why is the API domain (useApiFetch, upload/download) Nuxt-only?',
            'How do I configure the movk Vite plugin and vue-plugin?'
          ]
        },
        {
          category: 'AutoForm',
          items: [
            'How does a single Zod Schema define both validation and UI config?',
            'How do array and nested object fields render with dynamic add/remove?',
            'How do I replace field rendering with a Slot or custom control?',
            'How do I implement cross-field dependencies and conditional display?'
          ]
        },
        {
          category: 'DataTable',
          items: [
            'How do I switch between client-side and server-side pagination (rowCount / pageCount)?',
            'How do I configure cascading selection strategy for tree data?',
            'How do I pin columns, drag to resize, and add truncation + Tooltip?',
            'How do I declare selection / index / expand / action special columns?'
          ]
        },
        {
          category: 'API System (Nuxt)',
          items: [
            'How does response auto-unwrapping from an envelope (dataKey) work?',
            'How do I switch between multiple endpoints and inject auth tokens?',
            'How do I determine success/failure by business status code and show a Toast?',
            'How do I receive real-time upload / download progress callbacks?'
          ]
        },
        {
          category: 'Components',
          items: [
            'How does SearchForm auto-collapse based on row count?',
            'How do I configure PillGroup for multi-select and field mapping?',
            'How do I configure DatePicker output format and presets?',
            'How do I use With* input enhancements (clear / copy / counter / password)?',
            'How do I configure Tree checkbox cascading, parent-child strategy, and async lazy loading?'
          ]
        },
        {
          category: 'Composables & Theme',
          items: [
            'How do I avoid SSR flash when switching themes (Nuxt)?',
            'How do I export current theme CSS variables?',
            'How do I use useMessageBox imperatively for confirm / alert?',
            'How do I parse, format, and compare date ranges with useDateFormatter?'
          ]
        }
      ]
    }
  },
  github: {
    rootDir: 'docs',
    commitPath: 'src/runtime'
  },
  ui: {
    colors: {
      primary: 'indigo'
    },
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
        'to': 'mailto:mhaibaraai@gmail.com',
        'target': '_blank',
        'aria-label': 'YiXuan\'s Gmail'
      }
    ]
  }
})
