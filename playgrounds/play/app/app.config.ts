import type { ToasterProps } from '@nuxt/ui'

export default defineAppConfig({
  toaster: {
    position: 'top-center' as const,
    duration: 1500,
    max: 5,
    expand: true,
    disableSwipe: false
  } as ToasterProps
})
