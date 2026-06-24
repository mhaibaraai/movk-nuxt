import type { AnyObject } from '@movk/core'

/** 复刻 UTree 的 leading 图标解析：item.icon 优先，父节点回退传入的 folder 图标，叶子无图标返回 undefined */
export function resolveLeadingIcon(node: AnyObject, folderIcon: string): string | undefined {
  if (node.icon) return node.icon
  if (Array.isArray(node.children) && node.children.length) return folderIcon
  return undefined
}
