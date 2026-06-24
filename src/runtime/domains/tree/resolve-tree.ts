type AnyNode = Record<string, any>

/**
 * 按路径取值，复刻 UTree 的 get：无 `.` 时直接取字段，含 `.` 时按段深取，遇空短路
 *
 * 支持 labelKey 为点路径（如 'meta.title'），与 @nuxt/ui 的 GetItemKeys（含 DotPathKeys）对齐。
 */
export function getByPath<T extends AnyNode>(node: T, path: string): unknown {
  if (!path.includes('.')) return node[path]
  return path.split('.').reduce<any>((acc, key) => (acc == null ? acc : acc[key]), node)
}

/**
 * 构造与 UTree 一致的取键函数
 *
 * 复刻 UTree：提供 getKey 时取其返回值（为空则回退 label），否则取 labelKey 字段（支持点路径）。
 */
export function createGetKey<T extends AnyNode>(
  getKey?: (node: T) => string,
  labelKey = 'label'
): (node: T) => string {
  return (node) => {
    const label = getByPath(node, labelKey)
    const key = getKey ? getKey(node) || label : label
    return String(key)
  }
}

/**
 * 将自定义 childrenKey 归一化为 UTree 的 children 字段（UTree 写死 children）
 *
 * childrenKey 为默认 children 时原样返回（零拷贝）；否则深拷贝重命名并移除原字段，不修改入参。
 */
export function normalizeChildren<T extends AnyNode>(items: T[], childrenKey = 'children'): T[] {
  if (childrenKey === 'children') return items

  return items.map((node) => {
    const raw = node[childrenKey]
    const { [childrenKey]: _omit, ...rest } = node
    if (!Array.isArray(raw)) return rest as unknown as T
    return { ...rest, children: normalizeChildren(raw, childrenKey) } as unknown as T
  })
}
