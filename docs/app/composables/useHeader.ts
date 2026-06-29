export function useHeader() {
  const { t } = useI18n()
  const { localePath } = useMovkI18n()
  const route = useRoute()

  const isActive = (path: string) => route.path.startsWith(localePath(path))

  const desktopLinks = computed(() => [{
    label: t('nav.docs'),
    to: localePath('/docs/getting-started'),
    active: isActive('/docs')
  }, {
    label: t('nav.releases'),
    to: localePath('/releases')
  }])

  const docsNav = [
    { key: 'quickstart', icon: 'i-lucide-rocket', slug: 'getting-started' },
    { key: 'components', icon: 'i-lucide-box', slug: 'components' },
    { key: 'autoForm', icon: 'i-lucide-square-pen', slug: 'auto-form' },
    { key: 'dataTable', icon: 'i-lucide-table', slug: 'data-table' },
    { key: 'api', icon: 'i-lucide-cloud', slug: 'api' },
    { key: 'composables', icon: 'i-lucide-square-function', slug: 'composables' }
  ]

  const mobileLinks = computed(() => [
    ...docsNav.map(({ key, icon, slug }) => ({
      label: t(`nav.${key}`),
      icon,
      to: localePath(`/docs/${slug}`),
      active: isActive(`/docs/${slug}`)
    })),
    {
      label: t('nav.releases'),
      icon: 'i-lucide-newspaper',
      to: localePath('/releases')
    },
    {
      label: t('nav.github'),
      to: 'https://github.com/mhaibaraai/movk-nuxt',
      icon: 'i-simple-icons-github',
      target: '_blank'
    }
  ])

  return {
    desktopLinks,
    mobileLinks
  }
}
