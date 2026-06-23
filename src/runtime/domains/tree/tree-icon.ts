type AnyNode = Record<string, any>

export interface LeadingIconOptions {
  expandedIcon?: string
  collapsedIcon?: string
  folderOpen: string
  folder: string
}

/** 复刻 UTree 的 leading 图标解析：item.icon 优先，父节点回退展开/折叠图标，叶子无图标返回 undefined */
export function resolveLeadingIcon(node: AnyNode, expanded: boolean, options: LeadingIconOptions): string | undefined {
  if (node.icon) return node.icon
  if (Array.isArray(node.children) && node.children.length) {
    return expanded ? (options.expandedIcon ?? options.folderOpen) : (options.collapsedIcon ?? options.folder)
  }
  return undefined
}
