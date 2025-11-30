import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  extends: ['@movk/nuxt-docs'],
  modules: [
    '../src/module',
    (_, nuxt) => {
      nuxt.hook('components:dirs', (dirs) => {
        dirs.unshift({ path: resolve('./app/components/content/examples'), pathPrefix: false, prefix: '', global: true })
      })
    }
  ],
  css: ['~/assets/css/main.css'],
  site: {
    name: 'Movk Nuxt',
    url: 'https://nuxt.mhaibaraai.cn'
  },
  routeRules: {
    // redirects - default root pages
    '/docs': { redirect: '/docs/getting-started', prerender: false },
    '/docs/components': { redirect: '/docs/components/with-character-limit', prerender: false },
    '/docs/auto-form/field': { redirect: '/docs/auto-form/field/string', prerender: false },
    '/docs/auto-form/customization': { redirect: '/docs/auto-form/customization/collapsible', prerender: false },
    '/docs/composables': { redirect: '/docs/composables/use-auto-form', prerender: false }
  },
  compatibilityDate: 'latest'
})
