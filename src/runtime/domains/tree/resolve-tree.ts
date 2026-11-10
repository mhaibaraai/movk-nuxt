import type { AnyObject } from '@movk/core'
import { getPath } from '@movk/core'

/**
 * 构造节点取键函数，结果同时交给 UTree 使用，保证展开、选中与 UTree 内部的 key 一致
 *
 * getKey 返回值（空串沿用回退行为）优先于 valueKey 字段（仅字符串或数字，数字转为字符串），最后回退 labelKey 字段；
 * 字段名支持点路径。
 */
export function createGetKey<T extends AnyObject>(
  getKey?: (node: T) => string,
  labelKey = 'label',
  valueKey = 'value'
): (node: T) => string {
  return (node) => {
    const custom = getKey?.(node)
    if (custom) return String(custom)
    const value = getPath(node, valueKey)
    if (typeof value === 'string' || typeof value === 'number') return String(value)
    return String(getPath(node, labelKey))
  }
}

/**
 * 将自定义 childrenKey 归一化为 UTree 的 children 字段（UTree 写死 children）
 *
 * childrenKey 为默认 children 时原样返回（零拷贝）；否则深拷贝重命名并移除原字段，不修改入参。
 */
export function normalizeChildren<T extends AnyObject>(items: T[], childrenKey = 'children'): T[] {
  if (childrenKey === 'children') return items

  return items.map((node) => {
    const raw = node[childrenKey]
    const { [childrenKey]: _omit, ...rest } = node
    if (!Array.isArray(raw)) return rest as unknown as T
    return { ...rest, children: normalizeChildren(raw, childrenKey) } as unknown as T
  })
}
