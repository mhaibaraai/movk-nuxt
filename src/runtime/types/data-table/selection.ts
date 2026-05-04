import type { DataTableTreeSelectionStrategy } from './table'

export interface TreeSelectionResult<T> {
  /** TanStack 原生语义：所有 selected=true 的行对象 */
  selected: T[]
  /** 只包含叶子节点（无子节点）且被勾选的行 */
  leaves: T[]
  /** 父节点且所有子孙叶子均已选中（「全选」的父） */
  parents: T[]
  /** 父节点且子孙叶子部分选中（indeterminate） */
  halfSelected: T[]
  /**
   * 严格被用户勾选：排除因父级联而带上的子节点。
   * - 'isolated' / 'leaf'：等价于 `selected`
   * - 'cascade'：若自身被选且父节点也在 selected 中，视为级联产物，剔除
   */
  strictlyChecked: T[]
}

export interface TreeRowSelectionOptions {
  /** 行唯一字段，默认 'id' */
  rowKey?: string
  /** 子节点字段；未提供时视为扁平数据 */
  childrenKey?: string
  /** 与组件 selection strategy 保持一致，决定 strictlyChecked 派生口径 */
  strategy?: DataTableTreeSelectionStrategy
}
