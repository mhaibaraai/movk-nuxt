export default defineNuxtConfig({
  modules: ['@movk/nuxt'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  ui: {
    experimental: {
      componentDetection: true
    }
  },

  compatibilityDate: 'latest',

  vite: {
    optimizeDeps: {
      include: [
        '@internationalized/date',
        '@movk/core',
        '@tanstack/vue-table',
        'colortranslator',
        'maska/vue',
        'tailwind-variants',
        'tailwindcss/colors',
        'zod'
      ]
    }
  },

  movk: {
    theme: {
      font: 'Alibaba PuHuiTi'
    },
    api: {
      enabled: true,
      toast: { success: { show: true } },
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
