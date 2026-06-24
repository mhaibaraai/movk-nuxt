import type { AnyObject } from '@movk/core'
import { getPath } from '@movk/core'

/**
 * 默认搜索谓词：不区分大小写的文本包含匹配，空关键字视为全部命中
 *
 * 作为 `Tree.filter` 的默认匹配函数；高亮切分由 `@movk/core` 的 `splitHighlight` 承担。
 */
export function matchLabel(label: unknown, term: string): boolean {
  if (!term.trim()) return true
  if (label == null) return false
  return String(label).toLowerCase().includes(term.toLowerCase())
}

/** 按 labelKey 取节点文本（点路径，与 nodeLabel / createGetKey 一致）后做默认匹配 */
export function matchNode(node: AnyObject, labelKey: string, term: string): boolean {
  return matchLabel(getPath(node, labelKey), term)
}
