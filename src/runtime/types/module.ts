import type { FetchContext, FetchResponse } from 'ofetch'
import type { ApiInstance, MovkApiPublicConfig, EndpointPrivateConfig, MovkApiFullConfig } from './api'

interface MovkFontProviderConfig {
  /**
   * CDN 基础 URL
   * @see 'https://fonts.nuxt.com/get-started/providers#custom-providers'
   * @example 'https://cdn.org/fonts'
   */
  cdn: string
  /**
   * 需要加载的字重，默认全部加载
   * @example [300, 400, 500, 700]
   */
  weights?: number[]
}

export interface ModuleOptions {
  /**
   * 组件前缀
   * @defaultValue 'M'
   */
  prefix?: string
  /** API 模块配置 */
  api?: MovkApiFullConfig
  /** 主题系统配置 */
  theme?: {
    /**
     * 是否启用主题模块（appConfig 默认值、theme plugin、ThemePicker 组件）
     * @defaultValue true
     */
    enabled?: boolean
  }
  /** 字体提供器配置 */
  fonts?: {
    /**
     * 是否启用字体模块
     * @defaultValue true
     */
    enabled?: boolean
    /**
     * 阿里巴巴普惠体字体
     * @defaultValue 'https://cdn.mhaibaraai.cn/fonts'
     */
    alibabaPuhuiti?: MovkFontProviderConfig
  }
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
    ui: {
      colors: { primary: string, neutral: string, [key: string]: string }
      icons: Record<string, string>
      toaster?: import('@nuxt/ui').ToasterProps | null
      popconfirm?: {
        slots?: Partial<{
          content: string
          arrow: string
          header: string
          title: string
          description: string
          body: string
          footer: string
        }>
      }
    }
  }
}
