export default defineAppConfig({
  toaster: {
    expand: true,
    position: 'top-center' as const,
    duration: 3000,
    max: 5
  },
  header: {
    title: 'Movk Nuxt'
  },
  github: {
    rootDir: 'docs',
    branch: 'feat/0.0.1',
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
      primary: 'sky'
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
          icon: 'i-lucide-brain',
          to: 'https://nuxt.mhaibaraai.cn/llms.txt',
          target: '_blank',
          label: 'Open LLMs'
        },
        {
          icon: 'i-lucide-link',
          to: 'https://nuxt.mhaibaraai.cn/__link-checker__/link-checker-report.html',
          target: '_blank',
          label: 'Open Link Checker'
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
