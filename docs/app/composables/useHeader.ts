export function useHeader() {
  const route = useRoute()

  const desktopLinks = computed(() => [{
    label: '文档',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs/')
  }, {
    label: 'AutoForm',
    to: '/docs/auto-form',
    active: route.path.startsWith('/docs/auto-form')
  }])

  const mobileLinks = computed(() => [{
    label: '快速开始',
    icon: 'i-lucide-rocket',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs/getting-started')
  }, {
    label: 'AutoForm',
    icon: 'i-lucide-file-text',
    to: '/docs/auto-form',
    active: route.path.startsWith('/docs/auto-form')
  }])

  return {
    desktopLinks,
    mobileLinks
  }
}
