export default defineAppConfig({
  header: {
    title: 'Movk Nuxt'
  },
  toaster: {
    expand: true,
    position: 'top-center' as const,
    duration: 3000,
    max: 5
  },
  vercelAnalytics: {
    enable: true,
    debug: false
  },
  aiChat: {
    faqQuestions: [
      {
        category: '快速入门',
        items: [
          '如何安装 @movk/nuxt？',
          '支持哪些 Nuxt 版本？',
          '如何配置组件前缀？',
          '模块需要哪些前置依赖？'
        ]
      },
      {
        category: 'AutoForm 表单',
        items: [
          '如何创建基础表单？',
          '支持哪些字段类型？',
          '如何自定义字段渲染？',
          '如何使用 Slot 自定义布局？',
          '如何处理嵌套对象和数组？'
        ]
      },
      {
        category: 'API 系统',
        items: [
          '如何配置多个 API 端点？',
          'useApiFetch 和 useLazyApiFetch 有什么区别？',
          '如何使用 Hooks 扩展请求流程？',
          '如何监控上传/下载进度？'
        ]
      },
      {
        category: '组件',
        items: [
          '有哪些可用组件？',
          'DatePicker 和 ColorChooser 如何使用？',
          '输入增强组件（WithClear、WithCopy）怎么用？',
          'SlideVerify 如何配置？'
        ]
      },
      {
        category: 'Composables',
        items: [
          'useDateFormatter 支持哪些日期格式？',
          'useAutoForm 如何注册自定义控件？'
        ]
      },
      {
        category: '最佳实践',
        items: [
          '推荐的项目结构是什么？',
          'Composable 设计有哪些常用模式？'
        ]
      }
    ]
  },
  github: {
    rootDir: 'docs',
    commitPath: 'src/runtime'
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
    colors: {
      primary: 'emerald'
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
