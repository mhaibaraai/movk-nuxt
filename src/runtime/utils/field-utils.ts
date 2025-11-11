import type { VNode } from 'vue'
import type { AutoFormField } from '../types/auto-form'
import { UButton, UIcon } from '#components'
import { h } from 'vue'
import { setPath } from '../core'
import { AUTOFORM_META } from '../constants/auto-form'

/**
 * 字段分类
 */
export function classifyFields(fields: AutoFormField[]) {
  const leafFields: AutoFormField[] = []
  const nestedFields: AutoFormField[] = []
  const arrayFields: AutoFormField[] = []
  const layoutFields: AutoFormField[] = []

  for (const field of fields) {
    if (field.meta.type === AUTOFORM_META.LAYOUT_KEY) {
      layoutFields.push(field)
    } else if (field.meta.type === 'array') {
      arrayFields.push(field)
    } else if (isLeafField(field)) {
      leafFields.push(field)
    } else {
      nestedFields.push(field)
    }
  }

  return {
    leafFields,
    nestedFields,
    arrayFields,
    layoutFields,
    hasComplexFields: nestedFields.length > 0 || arrayFields.length > 0 || layoutFields.length > 0
  }
}

/**
 * 优化的字段类型检测 - 基于 meta.type 判断
 * @param field - 自动表单字段
 * @returns 是否为叶子字段（非 object 和 array）
 */
export function isLeafField(field: AutoFormField): boolean {
  return field.meta.type !== 'object' && field.meta.type !== 'array'
}

/**
 * 获取字段类型
 * @param field - 自动表单字段
 * @returns 字段类型
 */
export function getFieldType(field: AutoFormField): 'leaf' | 'nested' {
  return isLeafField(field) ? 'leaf' : 'nested'
}

/**
 * 收集字段默认值
 */
export function collectFieldDefaults(field: AutoFormField) {
  if (field.meta?.type === 'object') {
    const result: Record<string, any> = {}
    const basePath = field.path

    function collect(currentField: AutoFormField) {
      if (currentField.decorators?.defaultValue !== undefined) {
        const relativePath = currentField.path.replace(`${basePath}.`, '')
        setPath(result, relativePath, currentField.decorators.defaultValue)
      }

      if (currentField.children?.length) {
        currentField.children.forEach(collect)
      }
    }

    collect(field)
    return result
  }

  return field.decorators?.defaultValue !== undefined
    ? field.decorators.defaultValue
    : undefined
}

/** 创建提示插槽工厂 */
export function createHintSlotFactory(removeCallback: (count?: number) => void) {
  return (field: AutoFormField, path: string, open?: boolean, count?: number): VNode | undefined => {
    const isNested = path.includes('.')
    const isObject = field.meta?.type === 'object'

    if (isNested && !isObject) {
      return undefined
    }

    const chevronIcon = h(UIcon, {
      name: open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right',
      class: 'shrink-0 size-5 transition-transform duration-200'
    })

    if (isNested) {
      return chevronIcon
    }

    const deleteButton = h(UButton, {
      icon: 'i-lucide-trash-2',
      color: 'error',
      variant: 'ghost',
      size: 'sm',
      square: true,
      onClick: (event) => {
        event?.stopPropagation()
        removeCallback(count)
      }
    })

    if (!isObject) {
      return deleteButton
    }

    return h('div', { class: 'flex items-center gap-2' }, [
      deleteButton,
      chevronIcon
    ])
  }
}
