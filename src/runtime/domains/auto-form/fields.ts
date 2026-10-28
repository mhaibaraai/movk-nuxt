import type { VNode } from 'vue'
import type { AutoFormField } from '../../types/auto-form'
import { UButton, UIcon } from '#components'
import { h } from 'vue'
import { getPath, joinPath, setPath, toPath } from '@movk/core'
import { AUTOFORM_META } from './constants'

/** 沿字段树回填带 defaultValue 的叶子节点，已存在值的路径不覆盖 */
export function applyFieldDefaults(fields: AutoFormField[], target: Record<string, any>) {
  if (!fields.length) return

  const updates: Array<{ path: string, value: unknown }> = []

  function collect(items: AutoFormField[]) {
    for (const field of items) {
      if (field?.decorators?.defaultValue !== undefined
        && getPath(target, field.path) === undefined) {
        updates.push({ path: field.path, value: field.decorators.defaultValue })
      }
      if (field?.children && Array.isArray(field.children) && field.children.length > 0) {
        collect(field.children)
      }
    }
  }

  collect(fields)
  for (const { path, value } of updates) setPath(target, path, value)
}

/** 将字段列表分类为叶子/嵌套/数组/布局四组 */
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

export function isLeafField(field: AutoFormField): boolean {
  return field.meta.type !== 'object' && field.meta.type !== 'array'
}

/** 把 `path` 中属于 `base` 的前缀段剥离，返回相对路径段；不以 `base` 开头时返回 undefined */
function relativeSegments(path: string, base: string): Array<string | number> | undefined {
  const segments = toPath(path)
  const baseSegments = toPath(base)
  const matches = baseSegments.every((segment, index) => String(segments[index]) === String(segment))
  return matches ? segments.slice(baseSegments.length) : undefined
}

/** 按路径段把字段树中以 `from` 开头的路径替换为 `to`，递归处理 children 与 arrayElement，不修改原字段 */
export function remapFieldPath(field: AutoFormField, from: string, to: string): AutoFormField {
  const rest = relativeSegments(field.path, from)
  const path = rest ? joinPath([...toPath(to), ...rest]) : field.path

  return {
    ...field,
    path,
    ...(field.children && { children: field.children.map(child => remapFieldPath(child, from, to)) }),
    ...(field.arrayElement && { arrayElement: remapFieldPath(field.arrayElement, from, to) })
  }
}

/** 递归收集字段的默认值，object 类型返回嵌套结构，叶子类型直接返回值 */
export function collectFieldDefaults(field: AutoFormField) {
  if (field.meta?.type !== 'object') return field.decorators?.defaultValue

  const result: Record<string, any> = {}

  function collect(currentField: AutoFormField) {
    const rest = relativeSegments(currentField.path, field.path)
    if (currentField.decorators?.defaultValue !== undefined && rest?.length) {
      setPath(result, joinPath(rest), currentField.decorators.defaultValue)
    }
    currentField.children?.forEach(collect)
  }

  collect(field)
  return result
}

/** 从 items 选项中提取枚举值，支持对象格式（取 valueKey/value/label）和原始值 */
export function extractEnumValuesFromItems(items: any, valueKey?: string): string[] {
  if (!items || !Array.isArray(items)) {
    return []
  }

  const flatItems = items.flat()

  return flatItems
    .filter((item: any) => {
      if (item && typeof item === 'object' && (item.type === 'separator' || item.type === 'label')) {
        return false
      }
      return true
    })
    .map((item: any) => {
      if (item && typeof item === 'object') {
        if (valueKey && valueKey in item) {
          return item[valueKey]
        }
        if ('value' in item) {
          return item.value
        }
        if ('label' in item) {
          return item.label
        }
        return String(item)
      }
      return item
    })
    .filter((value: any) => value !== undefined && value !== null) as string[]
}

export interface ArrayItemActions {
  remove: (index: number) => void
  /** 提供时渲染上移 / 下移按钮 */
  move?: (index: number, offset: -1 | 1) => void
  /** 提供时渲染复制按钮 */
  duplicate?: (index: number) => void
  canRemove: () => boolean
  canAdd: () => boolean
  length: () => number
  labels: { moveUp: string, moveDown: string, duplicate: string, remove: string }
}

function itemButton(icon: string, label: string, onClick: () => void, options: { color?: 'error' | 'neutral', disabled?: boolean } = {}) {
  return h(UButton, {
    'icon': icon,
    'color': options.color ?? 'neutral',
    'variant': 'ghost',
    'size': 'xs',
    'aria-label': label,
    'disabled': options.disabled,
    'onClick': (event: Event) => {
      event?.stopPropagation()
      onClick()
    }
  })
}

/** 创建数组项的 hint 插槽渲染函数：项根节点渲染操作按钮（对象项另加折叠图标），嵌套对象只渲染折叠图标 */
export function createHintSlotFactory(actions: ArrayItemActions) {
  return (field: AutoFormField, isItemRoot: boolean, open?: boolean, count?: number): VNode | undefined => {
    const isObject = field.meta?.type === 'object'

    if (!isItemRoot && !isObject) {
      return undefined
    }

    const chevronIcon = h(UIcon, {
      name: open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right',
      class: 'shrink-0 size-5 transition-transform duration-200'
    })

    if (!isItemRoot || count === undefined) {
      return chevronIcon
    }

    const { labels, move, duplicate } = actions
    const buttons = [
      move && itemButton('i-lucide-arrow-up', labels.moveUp, () => move(count, -1), { disabled: count === 0 }),
      move && itemButton('i-lucide-arrow-down', labels.moveDown, () => move(count, 1), { disabled: count >= actions.length() - 1 }),
      duplicate && itemButton('i-lucide-copy', labels.duplicate, () => duplicate(count), { disabled: !actions.canAdd() }),
      itemButton('i-lucide-trash-2', labels.remove, () => actions.remove(count), { color: 'error', disabled: !actions.canRemove() })
    ].filter((node): node is VNode => !!node)

    return h('div', { class: 'flex items-center gap-0.5' }, isObject ? [...buttons, chevronIcon] : buttons)
  }
}
