export default defineNuxtConfig({
  modules: ['@movk/nuxt'],

  devtools: { enabled: true },

  ui: {
    experimental: {
      componentDetection: true
    }
  },

  compatibilityDate: 'latest',

  vite: {
    optimizeDeps: {
      include: [
        '@movk/core',
        '@tanstack/vue-table',
        'tailwind-variants',
        'tailwindcss/colors'
      ]
    }
  },

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
