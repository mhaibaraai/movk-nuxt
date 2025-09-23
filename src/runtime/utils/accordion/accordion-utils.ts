import type { AccordionItem } from '@nuxt/ui'
import type { AccordionConfig, AutoFormField, AutoFormFieldContext } from '../../types/auto-form'
import { isFunction } from '@movk/core'
import { unref } from 'vue'
import { startCase } from '../../core'

/**
 * 检测字段是否为对象字段（容器字段）
 * @param field 字段
 * @returns 是否为对象字段
 */
function isObjectField(field: AutoFormField): boolean {
  return !!(field.children && field.children.length > 0)
}

/**
 * 检测字段是否为叶子节点字段（有控件的字段）
 * @param field 字段
 * @returns 是否为叶子节点字段
 */
export function isLeafField(field: AutoFormField): boolean {
  return !isObjectField(field)
}

/**
 * 检测字段列表中是否包含对象字段
 * @param fields 字段列表
 * @returns 是否包含对象字段
 */
function hasObjectFields(fields: AutoFormField[]): boolean {
  return fields.some(field => isObjectField(field))
}

/**
 * 递归展平字段列表，只返回叶子节点字段
 * @param fields 字段列表
 * @returns 展平后的叶子节点字段列表
 */
export function flattenFields(fields: AutoFormField[]): AutoFormField[] {
  const result: AutoFormField[] = []

  for (const field of fields) {
    if (isLeafField(field)) {
      // 叶子节点直接添加
      result.push(field)
    }
    else if (field.children) {
      // 对象字段递归展平其子字段
      result.push(...flattenFields(field.children))
    }
  }

  return result
}

/**
 * 将字段按类型分组
 * @param fields 字段列表
 * @returns 分组后的字段
 */
export function groupFieldsByType(fields: AutoFormField[]) {
  const objectFields: AutoFormField[] = []
  const regularFields: AutoFormField[] = []

  for (const field of fields) {
    if (isObjectField(field)) {
      objectFields.push(field)
    }
    else {
      regularFields.push(field)
    }
  }

  return {
    objectFields,
    regularFields,
  }
}

/**
 * 递归收集所有对象字段（包括嵌套的）
 * @param fields 字段列表
 * @returns 所有对象字段的扁平列表
 */
export function collectAllObjectFields(fields: AutoFormField[]): AutoFormField[] {
  const result: AutoFormField[] = []

  for (const field of fields) {
    if (isObjectField(field)) {
      result.push(field)
      // 递归收集子字段中的对象字段
      if (field.children) {
        result.push(...collectAllObjectFields(field.children))
      }
    }
  }

  return result
}

/**
 * 只收集顶级对象字段（不包括嵌套的）
 * @param fields 字段列表
 * @returns 顶级对象字段列表
 */
export function collectTopLevelObjectFields(fields: AutoFormField[]): AutoFormField[] {
  return fields.filter(field => isObjectField(field))
}

/**
 * 生成 UAccordion 的 items 配置
 * @param objectFields 对象字段列表
 * @param config Accordion 配置
 * @returns AccordionItem 数组
 */
export function generateAccordionItems(
  objectFields: AutoFormField[],
  config?: AccordionConfig,
): AccordionItem[] {
  return objectFields.map((field) => {
    // 使用自定义生成器（如果提供）
    if (config?.itemGenerator) {
      return config.itemGenerator(field)
    }

    // 创建字段上下文来解析 ReactiveValue
    const context: AutoFormFieldContext = {
      state: {},
      path: field.path,
      value: undefined,
      setValue: () => {},
    }

    // 解析标签
    const label = field.meta.label
    const resolvedLabel = isFunction(label) ? label(context) : (unref(label) || startCase(field.path))

    // 默认生成逻辑
    const defaultItem: AccordionItem = {
      label: resolvedLabel,
      value: field.path,
      slot: `content-${field.path}`,
    }

    // 应用字段级覆盖配置
    const fieldOverride = config?.fieldOverrides?.[field.path]
    if (fieldOverride) {
      return { ...defaultItem, ...fieldOverride }
    }

    return defaultItem
  })
}

/**
 * 检查是否应该启用 UAccordion 包装
 * @param fields 字段列表
 * @param config Accordion 配置
 * @returns 是否应该启用
 */
export function shouldEnableAccordion(
  fields: AutoFormField[],
  config?: AccordionConfig,
): boolean {
  if (!config?.enabled) {
    return false
  }

  // 如果配置了只对包含对象字段的表单启用
  if (config.onlyForObjectFields !== false) {
    return hasObjectFields(fields)
  }

  return true
}
