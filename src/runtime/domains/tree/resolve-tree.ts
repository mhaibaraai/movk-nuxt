import type { AnyObject } from '@movk/core'
import { getPath } from '@movk/core'

/**
 * 构造与 UTree 一致的取键函数
 *
 * 复刻 UTree：提供 getKey 时取其返回值（为空则回退 label），否则按 labelKey 取值（支持点路径，与 UTree 内部 get 一致）。
 */
export function createGetKey<T extends AnyObject>(
  getKey?: (node: T) => string,
  labelKey = 'label'
): (node: T) => string {
  return (node) => {
    const label = getPath(node, labelKey)
    const key = getKey ? getKey(node) || label : label
    return String(key)
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
