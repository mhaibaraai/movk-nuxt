import type { FormProps } from '@nuxt/ui'
import type { z } from 'zod'
import type { OmitByKey } from '@movk/core'
import type { AutoFormControls } from './controls'
import type { ZodAutoFormFieldMeta } from '../zod'
import type { ClassNameValue } from '../shared'

export interface BaseAutoFormProps<S extends z.ZodObject, T extends boolean = true, N extends boolean = false>
  extends /** @vue-ignore */ OmitByKey<FormProps<S, T, N>, 'schema' | 'state' | 'loadingAuto' | 'validateOn' | 'ui'> {
  /** Zod 对象 schema，定义表单字段 */
  schema: S
  /** 自定义控件映射 */
  controls?: AutoFormControls
  /** 全局字段元数据配置 */
  globalMeta?: ZodAutoFormFieldMeta
  /**
   * 是否启用自动 loading 功能。
   * @defaultValue true
   */
  loadingAuto?: FormProps<S, T, N>['loadingAuto']
  /**
   * 表单验证时机，详见 UForm 的 validateOn 属性
   * @defaultValue []
   */
  validateOn?: FormProps<S, T, N>['validateOn']
  class?: ClassNameValue
  ui?: Record<string, ClassNameValue>
}
