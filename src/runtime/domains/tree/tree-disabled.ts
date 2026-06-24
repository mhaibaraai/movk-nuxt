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
