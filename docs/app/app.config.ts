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
          '如何安装和配置？',
          '如何创建第一个表单？',
          '如何查看组件列表？'
        ]
      },
      {
        category: 'AutoForm 表单',
        items: [
          '支持哪些控件类型？',
          '如何定义嵌套对象和数组？',
          '如何实现条件显示？',
          '如何自定义控件和样式？'
        ]
      },
      {
        category: 'API 集成',
        items: [
          '如何发起 API 请求？',
          '如何配置认证登录？',
          '如何监控上传进度？',
          '如何监控下载进度？'
        ]
      },
      {
        category: '独立组件',
        items: [
          '如何单独使用组件？',
          'DatePicker 如何配置？',
          'WithCopy 等增强组件如何用？',
          '如何覆盖组件样式？'
        ]
      },
      {
        category: 'Composables',
        items: [
          'useDateFormatter 如何用？',
          'useAutoForm 如何获取元数据？',
          'useApiAuth 如何管理认证？',
          'useUploadWithProgress 如何使用？'
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
  theme: {
    radius: 0
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
