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
    '/docs/components': { redirect: '/docs/components/with-copy', prerender: false },
    '/docs/auto-form': { redirect: '/docs/auto-form/core', prerender: false },
    '/docs/auto-form/field': { redirect: '/docs/auto-form/field/string', prerender: false }
  },
  compatibilityDate: 'latest'
})
