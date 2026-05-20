<script setup lang="ts">
import type {
  DataTableAction,
  DataTableActionsColumn,
  DataTableColumn,
  DataTableExposed,
  RowPinningState,
  RowSelectionState
} from '@movk/nuxt'
import type { Person } from '../../composables/useMockData'

const flatData = makePeople(12)
const treeData = makePeopleTree(3, 3)

const log = ref<string[]>([])
function record(msg: string) {
  log.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...log.value].slice(0, 10)
}

const baseColumns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名', size: 110 },
  { accessorKey: 'department', header: '部门', size: 90 },
  { accessorKey: 'role', header: '岗位', size: 120 }
]

const treeBaseColumns: DataTableColumn<Person>[] = [
  { type: 'expand' },
  { accessorKey: 'name', header: '姓名', size: 160 },
  { accessorKey: 'department', header: '部门', size: 90 }
]

// A1 多选列基础
const multipleSelection = ref<RowSelectionState>({})
const multipleColumns: DataTableColumn<Person>[] = [
  { type: 'selection' },
  ...baseColumns
]

// A2 单选列
const singleSelection = ref<RowSelectionState>({})
const singleColumns: DataTableColumn<Person>[] = [
  { type: 'selection', mode: 'single', header: '选择' },
  ...baseColumns
]

// A3 树形选择策略对照
const cascadeSelection = ref<RowSelectionState>({})
const isolatedSelection = ref<RowSelectionState>({})
const leafSelection = ref<RowSelectionState>({})
function strategyColumns(strategy: 'cascade' | 'isolated' | 'leaf'): DataTableColumn<Person>[] {
  return [
    { type: 'selection', strategy },
    ...treeBaseColumns
  ]
}

// A4 函数式 checkboxProps：按 scope/isLeafAggregate/行数据派生
const dynamicCheckboxSelection = ref<RowSelectionState>({})
const dynamicCheckboxColumns: DataTableColumn<Person>[] = [
  {
    type: 'selection',
    strategy: 'leaf',
    checkboxProps: (ctx) => {
      if (ctx.scope === 'header') return { color: 'success' }
      if (ctx.isLeafAggregate) return { color: 'neutral' }
      return {
        disabled: ctx.cellContext.row.original.status === 'offboarded',
        color: 'primary'
      }
    }
  },
  { type: 'expand' },
  { accessorKey: 'name', header: '姓名', size: 160 },
  { accessorKey: 'status', header: '状态', size: 90 }
]

// A5 rowSelectionKeys 数组 v-model + treeSelection expose
const selectionKeys = ref<string[]>([])
const treeSelectionRef = useTemplateRef<DataTableExposed<Person>>('treeSelectionRef')
const treeSelectionView = computed(() => {
  const r = treeSelectionRef.value?.treeSelection
  if (!r) return { leaves: [], parents: [], halfSelected: [] }
  return {
    leaves: r.leaves.map(p => p.name),
    parents: r.parents.map(p => p.name),
    halfSelected: r.halfSelected.map(p => p.name)
  }
})
const keysColumns: DataTableColumn<Person>[] = [
  { type: 'selection' },
  ...treeBaseColumns
]

// B 索引列
const indexedColumns: DataTableColumn<Person>[] = [
  { type: 'index' },
  ...baseColumns
]
const indexedCustomColumns: DataTableColumn<Person>[] = [
  { type: 'index', header: '序' },
  { accessorKey: 'name', header: '姓名', sortable: true, size: 110 },
  { accessorKey: 'salary', header: '薪资', sortable: true, size: 100 }
]
const indexedPagination = ref({ pageIndex: 0, pageSize: 5 })

// C1 顶/底固定列对照
const topPinning = ref<RowPinningState>({ top: [], bottom: [] })
const bottomPinning = ref<RowPinningState>({ top: [], bottom: [] })
const topPinColumns: DataTableColumn<Person>[] = [
  { type: 'row-pinning', position: 'top', header: '顶' },
  ...baseColumns
]
const bottomPinColumns: DataTableColumn<Person>[] = [
  { type: 'row-pinning', position: 'bottom', header: '底' },
  ...baseColumns
]

// C2 动态固定按钮
const dynamicPinColumns: DataTableColumn<Person>[] = [
  {
    type: 'row-pinning',
    buttonProps: ({ pinned }) => pinned
      ? { icon: 'i-lucide-pin-off', color: 'primary', variant: 'soft' }
      : { icon: 'i-lucide-pin', color: 'neutral', variant: 'ghost' }
  },
  ...baseColumns
]

// D 操作列共用动作
const baseActions: DataTableAction<Person>[] = [
  {
    key: 'view',
    buttonProps: { icon: 'i-lucide-eye', variant: 'ghost', size: 'xs' },
    onClick: ({ row }) => record(`view ${row.name}`)
  },
  {
    key: 'edit',
    buttonProps: { icon: 'i-lucide-pencil', variant: 'ghost', size: 'xs' },
    onClick: ({ row }) => record(`edit ${row.name}`)
  }
]

// D1 内联与折叠：maxInline + divider
const inlineColumns: DataTableColumn<Person>[] = [
  ...baseColumns,
  {
    type: 'actions',
    maxInline: 2,
    actions: [
      ...baseActions,
      {
        key: 'archive',
        buttonProps: { icon: 'i-lucide-archive', label: '归档', size: 'xs' },
        onClick: ({ row }) => record(`archive ${row.name}`)
      },
      {
        key: 'export',
        buttonProps: { icon: 'i-lucide-download', label: '导出', size: 'xs' },
        onClick: ({ row }) => record(`export ${row.name}`)
      },
      {
        key: 'delete',
        divider: true,
        buttonProps: { icon: 'i-lucide-trash-2', label: '删除', color: 'error', size: 'xs' },
        onClick: ({ row }) => record(`delete ${row.name}`)
      }
    ]
  }
]

// D2 数组与函数式 actions：按部门派生
const arrayActionsColumns: DataTableColumn<Person>[] = [
  ...baseColumns,
  { type: 'actions', actions: baseActions, size: 80 }
]

const fnActionsColumn: DataTableActionsColumn<Person>['actions'] = ({ row: { original } }) => {
  const extras: DataTableAction<Person>[] = []
  if (original.department === '研发') {
    extras.push({
      key: 'resetPwd',
      buttonProps: { icon: 'i-lucide-key-round', variant: 'ghost', size: 'xs' },
      onClick: ({ row }) => record(`resetPwd ${row.name}`)
    })
  }
  if (original.department === '设计') {
    extras.push({
      key: 'transfer',
      buttonProps: { icon: 'i-lucide-share-2', variant: 'ghost', size: 'xs' },
      onClick: ({ row }) => record(`transfer ${row.name}`)
    })
  }
  return [...baseActions, ...extras]
}
const fnActionsColumns: DataTableColumn<Person>[] = [
  ...baseColumns,
  { type: 'actions', maxInline: 4, actions: fnActionsColumn, size: 120 }
]

// D3 异步动作自动 loading
// loading 仅作用于内联按钮：溢出菜单 item 点击后菜单关闭，无视图承载 loading；故 maxInline 需 >= 异步 action 数量
const asyncActionsColumns: DataTableColumn<Person>[] = [
  ...baseColumns,
  {
    type: 'actions',
    maxInline: 3,
    size: 120,
    actions: [
      ...baseActions,
      {
        key: 'sync',
        buttonProps: { icon: 'i-lucide-refresh-cw', label: '同步', size: 'xs' },
        onClick: async ({ row }) => {
          record(`sync ${row.name} start`)
          await new Promise(r => setTimeout(r, 1200))
          record(`sync ${row.name} done`)
        }
      }
    ]
  }
]

// D4 二次确认 + 动态 confirmProps
const confirmActionsColumns: DataTableColumn<Person>[] = [
  ...baseColumns,
  { accessorKey: 'status', header: '状态', size: 90 },
  {
    type: 'actions',
    size: 120,
    actions: [
      ...baseActions,
      {
        key: 'delete',
        buttonProps: { icon: 'i-lucide-trash-2', label: '删除', color: 'error', size: 'xs' },
        confirm: true,
        confirmProps: ({ row }) => ({
          type: row.status === 'active' ? 'warning' : 'error',
          title: `删除 ${row.name}？`,
          description: row.status === 'active'
            ? '该员工处于在职状态，删除前请二次确认。'
            : '已离职员工删除后无法恢复。',
          confirmText: '我已确认'
        }),
        onClick: ({ row }) => record(`deleted ${row.name}`)
      }
    ]
  }
]

// D5 动态 disabled 与 visibility
const dynamicStateActionsColumns: DataTableColumn<Person>[] = [
  ...baseColumns,
  { accessorKey: 'status', header: '状态', size: 90 },
  {
    type: 'actions',
    maxInline: 3,
    size: 120,
    actions: [
      {
        key: 'view',
        buttonProps: { icon: 'i-lucide-eye', variant: 'ghost', size: 'xs' },
        onClick: ({ row }) => record(`view ${row.name}`)
      },
      {
        key: 'edit',
        buttonProps: { icon: 'i-lucide-pencil', variant: 'ghost', size: 'xs' },
        disabled: ({ row }) => row.status !== 'active',
        onClick: ({ row }) => record(`edit ${row.name}`)
      },
      {
        key: 'recall',
        buttonProps: { icon: 'i-lucide-undo-2', label: '召回', size: 'xs' },
        visibility: ({ row }) => row.status === 'offboarded',
        onClick: ({ row }) => record(`recall ${row.name}`)
      }
    ]
  }
]

// E 共享字段：visibility / pinable / resizable
const sharedFieldsColumns: DataTableColumn<Person>[] = [
  { type: 'selection', pinable: true, resizable: true },
  { type: 'index', visibility: false },
  { type: 'row-pinning', pinable: false },
  ...baseColumns,
  { type: 'actions', resizable: true, actions: baseActions }
]
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <Showcase
      title="多选列基础"
      description="列定义 type 为 selection 时自动渲染表头与单元格复选框，v-model:rowSelection 同步选中 id 字典"
      :state="multipleSelection"
      aside-label="rowSelection"
    >
      <MDataTable
        v-model:row-selection="multipleSelection"
        row-key="id"
        :columns="multipleColumns"
        :data="flatData.slice(0, 6)"
        bordered
      />
    </Showcase>

    <Showcase
      title="单选列"
      description="mode 为 single 时关闭多选并显示自定义 header，rowSelection 始终保持至多一个 key"
      :state="singleSelection"
      aside-label="rowSelection"
    >
      <MDataTable
        v-model:row-selection="singleSelection"
        row-key="id"
        :columns="singleColumns"
        :data="flatData.slice(0, 6)"
        bordered
      />
    </Showcase>

    <Showcase
      title="树形选择策略"
      description="strategy 取 cascade、isolated、leaf 时分别表现为父子级联、独立勾选、仅叶子可选；三表并排观察同一棵树的选中态差异"
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="flex flex-col gap-2">
          <div class="text-xs text-muted">
            cascade（父子级联）
          </div>
          <MDataTable
            v-model:row-selection="cascadeSelection"
            row-key="id"
            children-key="children"
            :columns="strategyColumns('cascade')"
            :data="treeData"
            bordered
          />
          <StateViewer :state="cascadeSelection" label="rowSelection" />
        </div>
        <div class="flex flex-col gap-2">
          <div class="text-xs text-muted">
            isolated（独立勾选）
          </div>
          <MDataTable
            v-model:row-selection="isolatedSelection"
            row-key="id"
            children-key="children"
            :columns="strategyColumns('isolated')"
            :data="treeData"
            bordered
          />
          <StateViewer :state="isolatedSelection" label="rowSelection" />
        </div>
        <div class="flex flex-col gap-2">
          <div class="text-xs text-muted">
            leaf（仅叶子）
          </div>
          <MDataTable
            v-model:row-selection="leafSelection"
            row-key="id"
            children-key="children"
            :columns="strategyColumns('leaf')"
            :data="treeData"
            bordered
          />
          <StateViewer :state="leafSelection" label="rowSelection" />
        </div>
      </div>
    </Showcase>

    <Showcase
      title="函数式 checkboxProps"
      description="checkboxProps 接收上下文返回 props，可按 scope 区分表头与单元格、按 isLeafAggregate 区分父行派生态、按行数据派生 disabled；本例配合 leaf 策略让三条分支都命中"
      :state="dynamicCheckboxSelection"
      aside-label="rowSelection"
    >
      <MDataTable
        v-model:row-selection="dynamicCheckboxSelection"
        row-key="id"
        children-key="children"
        :columns="dynamicCheckboxColumns"
        :data="treeData"
        bordered
      />
    </Showcase>

    <Showcase
      title="rowSelectionKeys 与 treeSelection"
      description="v-model:rowSelectionKeys 用数组形态外部受控，组件 expose 的 treeSelection 派生 leaves、parents、halfSelected 三类业务视图"
    >
      <MDataTable
        ref="treeSelectionRef"
        v-model:row-selection-keys="selectionKeys"
        row-key="id"
        children-key="children"
        :columns="keysColumns"
        :data="treeData"
        bordered
      />
      <template #aside>
        <StateViewer :state="selectionKeys" label="rowSelectionKeys" />
        <StateViewer :state="treeSelectionView" label="treeSelection 派生" />
      </template>
    </Showcase>

    <Showcase
      title="序号列与自动跟随"
      description="type 为 index 默认渲染 # 表头，行号随排序、分页自动重新计算"
      :state="indexedPagination"
      aside-label="右表 pagination"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MDataTable
          row-key="id"
          :columns="indexedColumns"
          :data="flatData.slice(0, 6)"
          bordered
        />
        <MDataTable
          v-model:pagination="indexedPagination"
          row-key="id"
          :columns="indexedCustomColumns"
          :data="flatData"
          bordered
        />
      </div>
    </Showcase>

    <Showcase
      title="顶部与底部固定"
      description="position 取 top 与 bottom 分别把行钉到表头或表尾，v-model:rowPinning 暴露 top、bottom 两组 id"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="flex flex-col gap-2">
          <MDataTable
            v-model:row-pinning="topPinning"
            row-key="id"
            :columns="topPinColumns"
            :data="flatData.slice(0, 8)"
            bordered
            :ui="{ root: 'max-h-65' }"
          />
          <StateViewer :state="topPinning" label="顶部 rowPinning" />
        </div>
        <div class="flex flex-col gap-2">
          <MDataTable
            v-model:row-pinning="bottomPinning"
            row-key="id"
            :columns="bottomPinColumns"
            :data="flatData.slice(0, 8)"
            bordered
            :ui="{ root: 'max-h-65' }"
          />
          <StateViewer :state="bottomPinning" label="底部 rowPinning" />
        </div>
      </div>
    </Showcase>

    <Showcase
      title="动态固定按钮"
      description="buttonProps 接收 pinned 状态返回 icon、color、variant，未固定与已固定行视觉区分"
    >
      <MDataTable
        row-key="id"
        :columns="dynamicPinColumns"
        :data="flatData.slice(0, 6)"
        bordered
      />
    </Showcase>

    <Showcase
      title="内联与折叠"
      description="maxInline 控制平铺按钮数，超出动作自动折叠到溢出菜单；action.divider 在菜单中插入分隔线"
      :state="log"
      aside-label="action 日志"
    >
      <MDataTable
        row-key="id"
        :columns="inlineColumns"
        :data="flatData.slice(0, 5)"
        bordered
      />
    </Showcase>

    <Showcase
      title="数组与函数式 actions"
      description="actions 既可传静态数组，也可传 ctx 回调按行数据派生动作；本例对研发追加重置密码、对设计追加转交资产"
      :state="log"
      aside-label="action 日志"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <div class="text-xs text-muted">
            静态数组
          </div>
          <MDataTable
            row-key="id"
            :columns="arrayActionsColumns"
            :data="flatData.slice(0, 5)"
            bordered
          />
        </div>
        <div class="flex flex-col gap-1">
          <div class="text-xs text-muted">
            函数派生（按部门）
          </div>
          <MDataTable
            row-key="id"
            :columns="fnActionsColumns"
            :data="flatData.slice(0, 5)"
            bordered
          />
        </div>
      </div>
    </Showcase>

    <Showcase
      title="异步动作自动 loading"
      description="onClick 返回 Promise 时按钮自动进入 loading，期间禁用并阻止重复触发，resolve 后恢复；仅作用于内联按钮，溢出菜单项点击后菜单立即关闭，loading 不可见"
      :state="log"
      aside-label="action 日志"
    >
      <MDataTable
        row-key="id"
        :columns="asyncActionsColumns"
        :data="flatData.slice(0, 5)"
        bordered
      />
    </Showcase>

    <Showcase
      title="二次确认"
      description="confirm 开启后点击先弹 MessageBox，confirmProps 动态返回 title、type、description、confirmText"
      :state="log"
      aside-label="action 日志"
    >
      <MDataTable
        row-key="id"
        :columns="confirmActionsColumns"
        :data="flatData.slice(0, 5)"
        bordered
      />
    </Showcase>

    <Showcase
      title="动态 disabled 与 visibility"
      description="action.disabled 与 action.visibility 接受布尔或回调，按行派生隐藏或禁用；本例只允许编辑 active 行、仅 offboarded 行显示召回"
      :state="log"
      aside-label="action 日志"
    >
      <MDataTable
        row-key="id"
        :columns="dynamicStateActionsColumns"
        :data="flatData.slice(0, 8)"
        bordered
      />
    </Showcase>

    <Showcase
      title="特殊列的可见性与固定"
      description="selection、index、row-pinning、actions 列同样支持 visibility、pinable、resizable，与数据列形态一致"
    >
      <MDataTable
        row-key="id"
        :columns="sharedFieldsColumns"
        :data="flatData.slice(0, 5)"
        bordered
      />
    </Showcase>
  </div>
</template>
