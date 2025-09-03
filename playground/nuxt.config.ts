export default defineNuxtConfig({
  modules: ['../src/module', '@nuxtjs/i18n', '@vueuse/motion/nuxt'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: 'https://mhaibaraai.cn/api/movk-backend',
    },
  },
  compatibilityDate: '2025-07-24',
  i18n: {
    detectBrowserLanguage: {
      cookieKey: 'movk-nuxt-i18n_redirected',
      fallbackLocale: 'zh_cn',
    },
  },
  icon: {
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons',
      },
    ],
  },
})
