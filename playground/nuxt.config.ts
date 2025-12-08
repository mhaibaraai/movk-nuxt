export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  compatibilityDate: 'latest',
  movk: {
    api: {
      endpoints: {
        default: {
          baseURL: 'http://vue.ruoyi.vip/prod-api'
        }
      }
    }
  }
})
