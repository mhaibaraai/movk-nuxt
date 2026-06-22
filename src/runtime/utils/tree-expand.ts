type AnyNode = Record<string, any>

/** 默认展开策略：true 全部父级、number 取 depth 小于该值、函数自定义 */
export type DefaultExpanded<T> = boolean | number | ((node: T, depth: number) => boolean)

/** key 派生上下文：depth 从 0 起算，index 为同层序号，parentKey 为父节点 key */
export interface ExpandKeyContext {
  depth: number
  index: number
  parentKey?: string
}

interface ExpandOptions<T> {
  /** 取节点唯一 key，可借 ctx 复刻 TanStack getRowId 的 index 路径 */
  getKey: (node: T, ctx: ExpandKeyContext) => string
  /** 取子节点数组，缺省读 node.children */
  getChildren?: (node: T) => unknown
}

/**
 * 由 defaultExpanded 策略推导初始展开的节点 key 列表（Tree 与 DataTable 共用）
 *
 * 仅命中有非空 children 的父节点；depth 从 0 起算，可复用为 expandToDepth（depth=0 收起全部）。
 * 通过 getKey / getChildren 适配不同数据形态与 key 派生规则。
 */
export function resolveDefaultExpandedKeys<T>(
  items: T[],
  defaultExpanded: DefaultExpanded<T>,
  options: ExpandOptions<T>
): string[] {
  if (!defaultExpanded) return []

  const { getKey } = options
  const getChildren = options.getChildren ?? ((node: T) => (node as AnyNode).children)
  const predicate = typeof defaultExpanded === 'function'
    ? defaultExpanded
    : typeof defaultExpanded === 'number'
      ? (_node: T, depth: number) => depth < defaultExpanded
      : () => true

  const keys: string[] = []
  const walk = (nodes: T[], depth: number, parentKey?: string): void => {
    nodes.forEach((node, index) => {
      const key = getKey(node, { depth, index, parentKey })
      const children = getChildren(node)
      if (!Array.isArray(children) || children.length === 0) return
      if (predicate(node, depth)) keys.push(key)
      walk(children as T[], depth + 1, key)
    })
  }
  walk(items, 0)
  return keys
}
