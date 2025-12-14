export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  compatibilityDate: 'latest',

  vite: {
    server: {
      proxy: {
        '/movk-backend': {
          target: 'https://server.mhaibaraai.cn',
          changeOrigin: true,
          secure: false,
          headers: {
            Origin: 'https://server.mhaibaraai.cn'
          }
        }
      }
    }
  },
  movk: {
    api: {
      auth: {
        enabled: true
      },
      endpoints: {
        default: {
          baseURL: '/movk-backend'
        }
      }
    }
  }
})
