import type { AnyObject } from '@movk/core'

/** 懒加载占位节点标记字段 */
export const PLACEHOLDER_FLAG = '__movkLazyPlaceholder'

/**
 * 懒加载节点的稳定内部 key 字段
 *
 * 取值为 getKey(node)，供 Tree.updateNode 按字段匹配定位节点。getKey 可被用户自定义，
 * 而 updateNode 仅支持按字段名匹配，写入此字段后无论 getKey 与 labelKey 是否一致都能命中。
 */
export const LAZY_KEY_FIELD = '__movkKey'

/** 占位节点记录所属父节点 key，供加载失败时定位重试 */
export const PLACEHOLDER_PARENT_FIELD = '__movkParent'

/** 判断节点是否为懒加载占位 */
export function isPlaceholder(node: AnyObject): boolean {
  return !!node[PLACEHOLDER_FLAG]
}

/**
 * 为懒加载父节点注入占位子节点
 *
 * UTree 仅在 `children.length` 为真时渲染展开箭头；对 `children` 未加载（缺省）且非叶子的节点，
 * 注入一个占位子节点使其可展开。展开时再由 `Tree.updateNode` 用真实子节点替换。不修改入参。
 */
export function markLazyPlaceholders<T extends AnyObject>(
  items: T[],
  getKey: (node: T) => string,
  labelKey = 'label'
): T[] {
  return items.map((node) => {
    const children = node.children
    if (Array.isArray(children)) {
      return { ...node, [LAZY_KEY_FIELD]: getKey(node), children: markLazyPlaceholders(children as T[], getKey, labelKey) }
    }
    if (node.isLeaf) return node
    const placeholder = {
      [labelKey]: `${PLACEHOLDER_FLAG}:${getKey(node)}`,
      [PLACEHOLDER_FLAG]: true,
      [PLACEHOLDER_PARENT_FIELD]: getKey(node)
    } as unknown as T
    return { ...node, [LAZY_KEY_FIELD]: getKey(node), children: [placeholder] }
  })
}

/** 占位节点所属父节点的 key */
export function placeholderParentKey(node: AnyObject): string | undefined {
  return isPlaceholder(node) ? node[PLACEHOLDER_PARENT_FIELD] : undefined
}

/**
 * 把已加载的子节点回填到仍为占位的父节点上，使 `items` 引用变化后已展开的懒加载子树不丢失。不修改入参
 */
export function restoreLoadedChildren<T extends AnyObject>(
  items: T[],
  loaded: ReadonlyMap<string, T[]>,
  getKey: (node: T) => string
): T[] {
  if (!loaded.size) return items
  return items.map((node) => {
    const children = node.children as T[] | undefined
    if (!Array.isArray(children)) return node
    const key = getKey(node)
    if (children.length === 1 && isPlaceholder(children[0]!) && loaded.has(key)) {
      const restored = loaded.get(key)!
      return { ...node, children: restoreLoadedChildren(restored, loaded, getKey) }
    }
    return { ...node, children: restoreLoadedChildren(children, loaded, getKey) }
  })
}
