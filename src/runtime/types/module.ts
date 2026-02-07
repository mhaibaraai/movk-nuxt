import type { FetchContext, FetchResponse } from 'ofetch'
import type { ApiInstance, MovkApiPublicConfig, EndpointPrivateConfig, MovkApiFullConfig } from './api'

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

declare module 'nuxt/app' {
  interface NuxtApp {
    $api: ApiInstance
  }

  interface RuntimeNuxtHooks {
    /** 请求发送前（认证注入后） */
    'movk:api:request': (context: FetchContext) => void | Promise<void>
    /** 响应成功（业务检查 + 解包后） */
    'movk:api:response': (
      context: FetchContext & { response: FetchResponse<any> }
    ) => void | Promise<void>
    /** 任何错误（业务错误 + HTTP 错误） */
    'movk:api:error': (
      context: FetchContext & { response: FetchResponse<any> }
    ) => void | Promise<void>
    /** 401 专用（支持 handled 标记跳过默认行为） */
    'movk:api:unauthorized': (
      context: FetchContext & { response: FetchResponse<any> },
      result: { handled: boolean }
    ) => void | Promise<void>
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
    movkApi: { endpoints?: Record<string, EndpointPrivateConfig> }
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
