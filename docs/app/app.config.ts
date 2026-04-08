export default defineAppConfig({
  toaster: {
    position: 'top-center' as const,
    duration: 3000
  },
  aiChat: {
    faqQuestions: [
      {
        category: 'AutoForm',
        items: [
          'Schema 能同时定义验证规则和 UI 提示吗？',
          '数组字段如何支持动态增删行？',
          '如何用 Slot 替换某个字段的渲染？'
        ]
      },
      {
        category: 'API 系统',
        items: [
          '响应数据如何自动从信封结构中解包？',
          '如何让某个请求跳过 Toast 提示？',
          '上传进度如何实时回调？'
        ]
      },
      {
        category: '组件',
        items: [
          'SearchForm 如何按行数自动折叠？',
          'SlideVerify 阈值和动画如何配置？',
          'DatePicker 输出格式如何指定？'
        ]
      },
      {
        category: 'Composables',
        items: [
          '如何避免主题切换时的 SSR 闪烁？',
          '如何导出当前主题的 CSS 变量？',
          'useDateFormatter 如何批量转换日期数组？'
        ]
      }
    ]
  },
  github: {
    rootDir: 'docs',
    commitPath: 'src/runtime'
  },
  ui: {
    colors: {
      primary: 'blue'
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
