import type {
  TreeEmits as NuxtTreeEmits,
  TreeProps as NuxtTreeProps,
  TreeSlots as NuxtTreeSlots,
  TreeItem
} from '@nuxt/ui'
import type { OmitByKey } from '@movk/core'
import type { VNode } from 'vue'
import type { ClassNameValue, TreeSelectionResult } from '../shared'

export type { TreeSelectionResult } from '../shared'

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
  extends /** @vue-ignore */ OmitByKey<NuxtTreeProps<T, M>, 'ui' | 'defaultExpanded'> {
  /** 树数据源，按 childrenKey 解析层级 */
  items?: T
  /**
   * 取子节点数组的字段名，归一化为 UTree 的 children
   * @defaultValue 'children'
   */
  childrenKey?: string
  /**
   * 展示字段名
   * @defaultValue 'label'
   */
  labelKey?: NuxtTreeProps<T, M>['labelKey']
  /** 自定义节点 key，缺省取 labelKey 字段值 */
  getKey?: NuxtTreeProps<T, M>['getKey']
  /**
   * 初始展开策略，缺省回退节点上的 defaultExpanded 标记
   * - true 展开全部父级
   * - number 展开 depth 小于该值的父级
   * - 函数 按节点与深度自定义
   */
  defaultExpanded?: boolean | number | ((node: T[number], depth: number) => boolean)
  /** 选中节点 key 列表，可用 v-model:selectedKeys 双向绑定 */
  selectedKeys?: string[]
  /** 开启多选 */
  multiple?: M & boolean
  /**
   * 多选 / checkable 下的父子勾选策略
   * - 'cascade' 父子级联（propagateSelect + bubbleSelect）
   * - 'isolated' 父子互不关联
   * @defaultValue 'cascade'
   */
  strategy?: TreeSelectionStrategy
  /** 选中父节点时级联选中子节点，缺省由 strategy 推导 */
  propagateSelect?: NuxtTreeProps<T, M>['propagateSelect']
  /** 子节点全部选中时回填父节点，缺省由 strategy 推导 */
  bubbleSelect?: NuxtTreeProps<T, M>['bubbleSelect']
  /** 尺寸 */
  size?: NuxtTreeProps<T, M>['size']
  /** 主色 */
  color?: NuxtTreeProps<T, M>['color']
  /** 开启顶部搜索过滤 */
  searchable?: boolean
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
  /** 渲染复选框并启用多选（multiple + strategy，默认 cascade） */
  checkable?: M & boolean
  ui?: Record<string, ClassNameValue>
}

/** 父子勾选策略 */
export type TreeSelectionStrategy = 'cascade' | 'isolated'

/** 组件实例暴露的命令式 API */
export interface TreeExposed<T extends TreeItem[] = TreeItem[]> {
  /** 展开全部可展开节点 */
  expandAll: () => void
  /** 收起全部节点 */
  collapseAll: () => void
  /** 展开到指定层级，depth=0 收起全部 */
  expandToDepth: (depth: number) => void
  /** 选中全部可选节点 */
  selectAll: () => void
  /** 清空选中 */
  clearSelection: () => void
  /** 当前选中结果分类 */
  treeSelection: TreeSelectionResult<T[number]>
}

/** 工具栏选中态摘要 */
export interface TreeSelectionSummary {
  /** 已选节点数 */
  checkedCount: number
  /** 可选节点总数 */
  total: number
  /** 是否全部选中 */
  allChecked: boolean
  /** 是否处于半选态 */
  indeterminate: boolean
}

export type TreeEmits<T extends TreeItem[] = TreeItem[], M extends boolean = false>
  = NuxtTreeEmits<T, M> & {
    'update:search': [value: string]
    'change': [payload: {
      value: NuxtTreeProps<T, M>['modelValue']
      keys: string[]
      selection: TreeSelectionResult<T[number]>
    }]
  }

interface TreeExtraSlots<T extends TreeItem[] = TreeItem[]> {
  'toolbar'?(props: {
    expandAll: () => void
    collapseAll: () => void
    toggleExpand: () => void
    allExpanded: boolean
    selectAll: () => void
    clear: () => void
    search: string
    selectionSummary: TreeSelectionSummary
  }): VNode[]
  /** 默认工具栏起始处追加内容 */
  'toolbar-leading'?(): VNode[]
  /** 默认工具栏末尾追加内容 */
  'toolbar-trailing'?(): VNode[]
  'empty'?(): VNode[]
  'loading'?(props: { node: T[number] }): VNode[]
}

export type TreeSlots<T extends TreeItem[] = TreeItem[]> = NuxtTreeSlots<T> & TreeExtraSlots<T>
