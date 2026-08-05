export default defineNuxtConfig({
  modules: ['@movk/nuxt'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  ui: {
    experimental: {
      componentDetection: true
    }
  },

  compatibilityDate: '2026-06-30',

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

  icon: {
    clientBundle: {
      scan: { globInclude: ['**/*.{vue,jsx,tsx,ts,md,mdc,mdx,yml,yaml}'] }
    }
  },

  movk: {
    theme: {
      font: 'Alibaba PuHuiTi'
    },
    api: {
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
