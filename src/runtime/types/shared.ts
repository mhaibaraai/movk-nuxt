import type { ClassValue } from 'tailwind-variants'

export type ClassNameValue = ClassValue
export type ClassNameArray = ClassNameValue[]

export type SemanticSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type SemanticColor = 'primary' | 'info' | 'success' | 'warning' | 'error' | 'neutral'

/** 树形选中结果分类，DataTable 与 Tree 共用 */
export interface TreeSelectionResult<T> {
  /** 所有被选中的行/节点 */
  selected: T[]
  /** 选中且无子节点的叶子 */
  leaves: T[]
  /** 子孙叶子全部选中的父级 */
  parents: T[]
  /** 子孙叶子部分选中的父级（半选） */
  halfSelected: T[]
  /** 严格被勾选：cascade 下排除因父级联带上的子节点 */
  strictlyChecked: T[]
}
