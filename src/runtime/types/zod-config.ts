import type { z } from 'zod'

/** 视为「缺失」并提示必填的输入值 */
export type ZodRequiredInput = undefined | null | ''

export interface MovkZodOptions {
  /** 校验文案语言：固定为某个 locale code，或 `'auto'` 跟随 `<UApp :locale>`（仅客户端，服务端使用 `fallback`） */
  locale: 'auto' | (string & {})
  /**
   * 映射不到 zod locale 时使用的语言
   * @defaultValue 'en'
   */
  fallback?: string
  /** `auto` 模式下静态打包的语言列表，缺省时只打包 `fallback`；固定 `locale` 时无需设置 */
  locales?: string[]
  /** 覆盖 locale code 到 `zod/locales` 导出名的映射，如 `{ 'zh-Hans': 'zhCN' }` */
  localeMap?: Record<string, string>
  /**
   * 必填提示：`true` 时输入为 `undefined` 视为缺失；对象形式可自定义缺失值；`false` 关闭
   * @defaultValue true
   */
  required?: boolean | { inputs?: ZodRequiredInput[] }
  /**
   * 必填提示是否从 schema meta 读取字段 `label` / `title` 插值
   * @defaultValue true
   */
  label?: boolean
  /**
   * 关闭 zod 的 JIT 编译，用于禁止 `new Function` 的严格 CSP 环境
   * @defaultValue false
   */
  jitless?: boolean
}

/** `movk:zod:config` 钩子与 Vue 插件选项可扩展的运行时配置 */
export interface MovkZodRuntimeConfig {
  /** 优先级最高的自定义错误映射，返回空值时继续走必填规则与 locale 文案 */
  customError?: z.core.$ZodErrorMap
}
