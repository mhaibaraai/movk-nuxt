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
