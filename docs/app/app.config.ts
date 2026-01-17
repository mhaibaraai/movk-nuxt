export default defineAppConfig({
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
          '模块依赖哪些库？'
        ]
      },
      {
        category: 'AutoForm 表单',
        items: [
          '如何创建基础表单？',
          '支持哪些字段类型？',
          '如何添加验证规则？',
          '如何实现条件渲染？',
          '如何处理嵌套对象和数组？'
        ]
      },
      {
        category: 'API 系统',
        items: [
          '如何配置 API 端点？',
          'useApiFetch 和 $fetch 区别？',
          '如何处理认证登录？',
          '如何监控上传/下载进度？'
        ]
      },
      {
        category: '独立组件',
        items: [
          '有哪些独立组件？',
          'DatePicker 如何使用？',
          'StarRating 如何自定义？',
          'SlideVerify 如何配置？'
        ]
      },
      {
        category: 'Composables',
        items: [
          'useDateFormatter 如何格式化日期？',
          'useAutoForm 如何定义自定义控件？',
          'useApiAuth 如何管理认证？',
          'useTheme 如何切换主题？'
        ]
      }
    ]
  },
  header: {
    title: 'Movk Nuxt'
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
