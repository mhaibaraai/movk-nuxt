export default defineNuxtConfig({
  modules: ['@movk/nuxt'],
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBase: 'http://t1.geosophon.com:11001/zz2/ai-engineering-cost',
    },
  },
  compatibilityDate: '2025-07-24',
  i18n: {
    strategy: 'prefix_except_default',
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
})
