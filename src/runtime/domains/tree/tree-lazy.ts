type AnyNode = Record<string, any>

/** 懒加载占位节点标记字段 */
export const PLACEHOLDER_FLAG = '__movkLazyPlaceholder'

/** 判断节点是否为懒加载占位 */
export function isPlaceholder(node: AnyNode): boolean {
  return !!node[PLACEHOLDER_FLAG]
}

/**
 * 为懒加载父节点注入占位子节点
 *
 * UTree 仅在 `children.length` 为真时渲染展开箭头；对 `children` 未加载（缺省）且非叶子的节点，
 * 注入一个占位子节点使其可展开。展开时再由 `Tree.updateNode` 用真实子节点替换。不修改入参。
 */
export function markLazyPlaceholders<T extends AnyNode>(
  items: T[],
  getKey: (node: T) => string,
  labelKey = 'label'
): T[] {
  return items.map((node) => {
    const children = node.children
    if (Array.isArray(children)) {
      return { ...node, children: markLazyPlaceholders(children as T[], getKey, labelKey) }
    }
    if (node.isLeaf) return node
    const placeholder = {
      [labelKey]: `${PLACEHOLDER_FLAG}:${getKey(node)}`,
      [PLACEHOLDER_FLAG]: true
    } as unknown as T
    return { ...node, children: [placeholder] }
  })
}
