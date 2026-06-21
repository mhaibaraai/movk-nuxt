import type {
  TreeEmits as NuxtTreeEmits,
  TreeProps as NuxtTreeProps,
  TreeSlots as NuxtTreeSlots,
  TreeItem
} from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { VNode } from 'vue'
import type { ClassNameValue } from '../shared'

export type { TreeItem } from '@nuxt/ui'

/** 在 UTree 节点基础上补充懒加载叶子标识 */
export interface MTreeItem extends TreeItem {
  /** 标记节点为叶子，懒加载模式下不渲染展开占位 */
  isLeaf?: boolean
}

/** 搜索匹配谓词，返回 true 表示该节点命中关键字 */
export type TreeFilter<T extends TreeItem = TreeItem> = (node: T, term: string) => boolean

/** 异步加载子节点，返回该节点的子节点数组 */
export type TreeLoadChildren<T extends TreeItem = TreeItem> = (node: T) => Promise<T[]>

export interface TreeProps<T extends TreeItem[] = TreeItem[], M extends boolean = false>
  extends /** @vue-ignore */ OmitByKey<NuxtTreeProps<T, M>, 'ui'> {
  /**
   * 取子节点数组的字段名，归一化为 UTree 的 children
   * @defaultValue 'children'
   */
  childrenKey?: string
  /** 开启顶部搜索过滤 */
  searchable?: boolean
  /** 搜索关键字，可用 v-model:search 双向绑定 */
  search?: string
  /** 自定义匹配谓词，缺省按 labelKey 文本不区分大小写包含匹配 */
  filter?: TreeFilter<T[number]>
  /**
   * 高亮命中文本，仅在 searchable 时生效
   * @defaultValue true
   */
  highlight?: boolean
  /** 开启异步懒加载子节点 */
  lazy?: boolean
  /** 懒加载回调，展开未加载的父节点时调用 */
  loadChildren?: TreeLoadChildren<T[number]>
  /** 开启顶部工具栏（展开/折叠，checkable 时附带全选/清空） */
  toolbar?: boolean
  /** 渲染复选框并启用多选与级联（multiple + propagateSelect + bubbleSelect） */
  checkable?: boolean
  ui?: Record<string, ClassNameValue>
}

export type TreeEmits<T extends TreeItem[] = TreeItem[], M extends boolean = false>
  = NuxtTreeEmits<T, M> & {
    'update:search': [value: string]
    'change': [payload: { value: NuxtTreeProps<T, M>['modelValue'], keys: string[] }]
  }

interface TreeExtraSlots<T extends TreeItem[] = TreeItem[]> {
  toolbar?(props: {
    expandAll: () => void
    collapseAll: () => void
    selectAll: () => void
    clear: () => void
    search: string
  }): VNode[]
  empty?(): VNode[]
  loading?(props: { node: T[number] }): VNode[]
}

export type TreeSlots<T extends TreeItem[] = TreeItem[]> = NuxtTreeSlots<T> & TreeExtraSlots<T>
