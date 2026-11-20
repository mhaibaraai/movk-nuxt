import type { FormProps } from '@nuxt/ui'
import type { z } from 'zod'
import type { OmitByKey } from '@movk/core'
import type { AutoFormControls } from './controls'
import type { ZodAutoFormFieldMeta } from '../zod'
import type { ClassNameValue } from '../shared'

export interface BaseAutoFormProps<S extends z.ZodObject, T extends boolean = true, N extends boolean = false>
  extends /** @vue-ignore */ OmitByKey<FormProps<S, T, N>, 'schema' | 'state' | 'loadingAuto' | 'validateOn' | 'ui' | 'onSubmit'> {
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
  /**
   * 字段被 `meta.if` 隐藏时如何处理其值：`keep` 保留，`clear` 置为 `undefined`；字段 meta 的 `hiddenValue` 优先。
   * 无论哪种策略，隐藏字段都不参与校验，也不出现在提交数据中
   * @defaultValue 'keep'
   */
  hiddenValue?: 'keep' | 'clear'
  /** 提交回调；返回 Promise 时配合 `loadingAuto` 显示加载状态 */
  onSubmit?: FormProps<S, T, N>['onSubmit']
  class?: ClassNameValue
  ui?: Record<string, ClassNameValue>
}
