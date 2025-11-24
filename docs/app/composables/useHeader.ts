export function useHeader() {
  const route = useRoute()

  const desktopLinks = computed(() => [{
    label: '文档',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs/')
  }, {
    label: 'AutoForm',
    to: '/docs/auto-form/basic-usage',
    active: route.path.startsWith('/docs/auto-form')
  }, {
    label: '示例',
    to: '/docs/examples',
    active: route.path.startsWith('/docs/examples')
  }, {
    label: '路线图',
    to: '/docs/roadmap',
    active: route.path.startsWith('/docs/roadmap')
  }])

  const mobileLinks = computed(() => [{
    label: '快速开始',
    icon: 'i-lucide-rocket',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs/getting-started')
  }, {
    label: 'AutoForm',
    icon: 'i-lucide-file-text',
    to: '/docs/auto-form/basic-usage',
    active: route.path.startsWith('/docs/auto-form')
  }, {
    label: '表单布局',
    icon: 'i-lucide-layout',
    to: '/docs/layout',
    active: route.path.startsWith('/docs/layout')
  }, {
    label: '高级用法',
    icon: 'i-lucide-wand-2',
    to: '/docs/advanced',
    active: route.path.startsWith('/docs/advanced')
  }, {
    label: '示例集合',
    icon: 'i-lucide-play-circle',
    to: '/docs/examples',
    active: route.path.startsWith('/docs/examples')
  }, {
    label: '路线图',
    icon: 'i-lucide-map',
    to: '/docs/roadmap',
    active: route.path.startsWith('/docs/roadmap')
  }])

  return {
    desktopLinks,
    mobileLinks
  }
}
