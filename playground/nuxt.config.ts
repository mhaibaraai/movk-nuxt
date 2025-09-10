export default defineNuxtConfig({
  modules: ['../src/module', '@vueuse/motion/nuxt'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: 'https://mhaibaraai.cn/api/movk-backend',
    },
  },
  compatibilityDate: '2025-07-24',
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'zh_cn',
    detectBrowserLanguage: {
      cookieKey: 'movk-nuxt-i18n_redirected',
      fallbackLocale: 'zh_cn',
    },
    locales: [
      { code: 'zh_cn', language: 'zh-CN', name: '简体中文', file: 'zh_cn.json' },
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
    ],
  },
  icon: {
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons',
      },
    ],
  },
  movk: {
    i18n: true,
  },
})
