import type { AnyObject } from '@movk/core'

/** 收集 disabled 子树的全部 key：节点自身 disabled 或祖先 disabled 即纳入 */
export function collectDisabledKeys<T extends AnyObject>(items: T[], getKey: (node: T) => string): Set<string> {
  const set = new Set<string>()
  const walk = (nodes: T[], ancestorDisabled: boolean) => {
    for (const node of nodes) {
      const disabled = ancestorDisabled || !!node.disabled
      if (disabled) set.add(getKey(node))
      if (Array.isArray(node.children)) walk(node.children as T[], disabled)
    }
  }
  walk(items, false)
  return set
}

/**
 * 向 disabled 子树注入 `disabled`，交由 UTree 原生置灰整棵后代；无 disabled 时零拷贝，
 * 有 disabled 时仅克隆受影响节点，保留其余节点引用，避免污染 v-model 节点 identity
 */
export function applyDisabled<T extends AnyObject>(nodes: T[], disabledKeys: ReadonlySet<string>, getKey: (node: T) => string): T[] {
  if (!disabledKeys.size) return nodes
  const inject = (list: T[]): T[] => list.map((node) => {
    const rawChildren = node.children
    const children = Array.isArray(rawChildren) ? inject(rawChildren as T[]) : rawChildren
    const disabled = disabledKeys.has(getKey(node))
    if (!disabled && children === rawChildren) return node
    return {
      ...node,
      ...(disabled ? { disabled: true } : null),
      ...(children !== rawChildren ? { children } : null)
    }
  })
  return inject(nodes)
}
