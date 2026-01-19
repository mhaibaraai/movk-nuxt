import type { ApiClient, MovkApiPublicConfig, MovkApiPrivateConfig, MovkApiFullConfig } from './api'

export interface ModuleOptions {
  /**
   * 组件前缀
   * @default 'M'
   */
  prefix?: string
  /**
   * API 模块配置
   */
  api?: MovkApiFullConfig
}

declare module '#app' {
  interface NuxtApp {
    $api: ApiClient
  }
}

declare module 'nuxt/schema' {
  interface NuxtConfig {
    movk?: ModuleOptions
  }

  interface NuxtOptions {
    movk: ModuleOptions
  }

  interface PublicRuntimeConfig {
    movkApi: MovkApiPublicConfig
  }

  interface RuntimeConfig {
    movkApi: MovkApiPrivateConfig
  }

  interface AppConfig {
    theme: {
      radius: number
      blackAsPrimary: boolean
      font: string
      icons: string
    }
  }
}
