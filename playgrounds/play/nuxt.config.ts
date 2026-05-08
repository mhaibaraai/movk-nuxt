export default defineNuxtConfig({
  modules: ['@movk/nuxt'],

  devtools: { enabled: true },

  compatibilityDate: 'latest',

  movk: {
    api: {
      enabled: true
    }
  }
})
