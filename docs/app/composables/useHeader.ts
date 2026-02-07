export function useHeader() {
  const route = useRoute()

  const desktopLinks = computed(() => [{
    label: '文档',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs/')
  }, {
    label: '版本发布',
    to: '/releases'
  }])

  const mobileLinks = computed(() => [{
    label: '快速开始',
    icon: 'i-lucide-rocket',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs/getting-started')
  }, {
    label: 'Components',
    icon: 'i-lucide-box',
    to: '/docs/components',
    active: route.path.startsWith('/docs/components')
  }, {
    label: 'AutoForm',
    icon: 'i-lucide-square-pen',
    to: '/docs/auto-form',
    active: route.path.startsWith('/docs/auto-form')
  }, {
    label: 'API',
    icon: 'i-lucide-cloud',
    to: '/docs/api',
    active: route.path.startsWith('/docs/api')
  }, {
    label: 'Composables',
    icon: 'i-lucide-square-function',
    to: '/docs/composables',
    active: route.path.startsWith('/docs/composables')
  }, {
    label: '发布版本',
    icon: 'i-lucide-newspaper',
    to: '/releases'
  }, {
    label: 'GitHub',
    to: 'https://github.com/mhaibaraai/movk-nuxt',
    icon: 'i-simple-icons-github',
    target: '_blank'
  }])

  return {
    desktopLinks,
    mobileLinks
  }
}
