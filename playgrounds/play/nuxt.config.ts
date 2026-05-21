export default defineNuxtConfig({
  modules: ['@movk/nuxt'],

  devtools: { enabled: true },

  compatibilityDate: 'latest',

  movk: {
    api: {
      enabled: true,
      endpoints: {
        default: { baseURL: '/api' },
        v2: { baseURL: '/api/demo/v2' }
      },
      auth: {
        enabled: true,
        sessionTokenPath: 'token',
        unauthorized: {
          redirect: false,
          clearSession: true
        }
      }
    }
  }
})
