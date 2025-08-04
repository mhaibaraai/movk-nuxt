export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBase: '',
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
})
