import type { NavigationMenuItem } from '@nuxt/ui'

const components: NavigationMenuItem[] = [
  {
    label: 'auto-form', icon: 'i-lucide-audio-waveform', defaultOpen: true, children: [
      { label: 'Basic', to: '/components/auto-form/basic' }
    ]
  }
]

export const useNavigation = () => {
  const items = [{ label: 'Home', icon: 'i-lucide-home', to: '/' }]
  const groups = computed(() => [
    { id: 'links', items },
    { id: 'components', label: 'Components', items: components }
  ])

  return {
    components,
    groups,
    items
  }
}
