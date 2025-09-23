import type { AccordionConfig, AutoFormAccordionItem, AutoFormField } from '../../types/auto-form'

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

// 判断子字段类型的辅助函数
export function getFieldType(field: AutoFormField): 'leaf' | 'nested' {
  return isLeafField(field) ? 'leaf' : 'nested'
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
 * 生成 UAccordion 的 item 配置
 * @param objectField 对象字段
 * @param config Accordion 配置
 * @returns AutoFormAccordionItem，包含字段信息
 */
export function generateAccordionItems(
  objectField: AutoFormField,
  config?: AccordionConfig,
): AutoFormAccordionItem {
  // 使用自定义生成器（如果提供）
  if (config?.itemGenerator) {
    const customItem = config.itemGenerator(objectField)
    // 确保包含 field 信息
    return { ...customItem, objectField } as AutoFormAccordionItem
  }

  // 默认生成逻辑 - 包含 field 信息
  const defaultItem: AutoFormAccordionItem = {
    slot: `content-${objectField.path}`,
    field: objectField, // 注入字段信息
  }

  // 应用字段级覆盖配置
  const fieldOverride = config?.fieldOverrides?.[objectField.path as keyof typeof config.fieldOverrides] || {}
  if (fieldOverride) {
    return { ...defaultItem, ...fieldOverride, field: objectField } as AutoFormAccordionItem
  }

  return defaultItem
}
