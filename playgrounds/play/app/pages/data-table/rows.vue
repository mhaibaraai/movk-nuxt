<script setup lang="ts">
import type {
  DataTableContextmenuHandler,
  DataTableExposed,
  DataTableHoverHandler,
  DataTableSelectHandler,
  ExpandedState,
  RowSelectionState
} from '@movk/nuxt'
import type { Person } from '../../composables/useMockData'

const data = makePeople(15)
const columns = usePeopleColumns()

function makeLog(limit = 8) {
  const entries = ref<string[]>([])
  const record = (msg: string) => {
    entries.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...entries.value].slice(0, limit)
  }
  return { entries, record }
}

const selectionState = ref<RowSelectionState>({})
const selectLog = makeLog()
const onSelect: DataTableSelectHandler<Person> = (_e, row) => selectLog.record(`select: ${row.original.name}`)

const expandedState = ref<ExpandedState>({})

const clickModeSelection = ref<RowSelectionState>({})
const clickModeExpanded = ref<ExpandedState>({})
const selectOnRowClick = ref(true)
const expandOnRowClick = ref(false)

function rowClassByStatus(row: Person): string {
  if (row.status === 'offboarded') return 'bg-gray-50/40 dark:bg-gray-900/10'
  if (row.status === 'leave') return 'bg-warning-50/40 dark:bg-warning-900/10'
  return ''
}
function rowStyleBySalary(row: Person): Record<string, string> {
  if (row.salary >= 40000) return { fontWeight: '600', color: 'var(--ui-color-error-600, #dc2626)' }
  if (row.salary >= 25000) return { fontWeight: '500' }
  return {}
}

const hovered = ref<string | null>(null)
const onHover: DataTableHoverHandler<Person> = (_e, row) => {
  hovered.value = row ? row.original.name : null
}

const contextmenuLog = makeLog(6)
const onRowContextmenu: DataTableContextmenuHandler<Person> = (e, row) => {
  e.preventDefault()
  contextmenuLog.record(`右键 ${row.original.name}`)
}

const tableRef = useTemplateRef<DataTableExposed<Person>>('tableRef')
const exposedSelection = ref<RowSelectionState>({})
function callClearSelection() {
  tableRef.value?.clearSelection()
}
function callScrollToTop() {
  tableRef.value?.scrollToTop({ behavior: 'smooth' })
}
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <Showcase
      title="基础行选择"
      description="v-model:rowSelection 双向同步选中 id 集合，select 事件返回当前点击行"
      :state="selectionState"
      aside-label="rowSelection"
    >
      <template #aside-extra>
        <StateViewer :state="selectLog.entries.value" label="select 事件" />
      </template>

      <MDataTable
        v-model:row-selection="selectionState"
        row-key="id"
        :columns="[{ type: 'selection' }, ...columns]"
        :data="data"
        bordered
        :ui="{ root: 'max-h-[50vh]' }"
        @select="onSelect"
      />
    </Showcase>

    <Showcase
      title="行展开与详情槽位"
      description="v-model:expanded 控制展开行 id，#expanded 槽位渲染详情区域"
      :state="expandedState"
      aside-label="expanded"
    >
      <MDataTable
        v-model:expanded="expandedState"
        row-key="id"
        :columns="[{ type: 'expand' }, ...columns]"
        :data="data"
        bordered
        :ui="{ root: 'max-h-[50vh]' }"
      >
        <template #expanded="{ row }">
          <div class="px-4 py-3 text-sm bg-elevated/30">
            <p>邮箱 {{ row.original.email }} · 入职 {{ row.original.joinedAt }}</p>
            <p>薪资 {{ row.original.salary.toLocaleString() }} · {{ row.original.level }}</p>
            <p class="text-muted">
              {{ row.original.bio }}
            </p>
          </div>
        </template>
      </MDataTable>
    </Showcase>

    <Showcase
      title="点行触发选择与展开"
      description="selectOnRowClick 整行点击切换选中，expandOnRowClick 整行点击切换展开，两者可独立开启"
    >
      <template #toolbar>
        <USwitch v-model="selectOnRowClick" label="selectOnRowClick" />
        <USwitch v-model="expandOnRowClick" label="expandOnRowClick" />
      </template>
      <template #aside>
        <StateViewer :state="clickModeSelection" label="rowSelection" />
        <StateViewer :state="clickModeExpanded" label="expanded" />
      </template>

      <MDataTable
        v-model:row-selection="clickModeSelection"
        v-model:expanded="clickModeExpanded"
        row-key="id"
        :columns="[{ type: 'selection' }, { type: 'expand' }, ...columns]"
        :data="data"
        :select-on-row-click="selectOnRowClick"
        :expand-on-row-click="expandOnRowClick"
        bordered
        :ui="{ root: 'max-h-[50vh]' }"
      >
        <template #expanded="{ row }">
          <div class="px-4 py-2 text-xs text-muted bg-elevated/30">
            {{ row.original.bio }}
          </div>
        </template>
      </MDataTable>
    </Showcase>

    <Showcase
      title="动态行样式"
      description="rowClass 接受 (row) => string，rowStyle 接受 (row) => 字符串或对象，按行数据派生类与内联样式"
    >
      <MDataTable
        row-key="id"
        :columns="columns"
        :data="data"
        :row-class="rowClassByStatus"
        :row-style="rowStyleBySalary"
        bordered
        :ui="{ root: 'max-h-[50vh]' }"
      />
    </Showcase>

    <Showcase
      title="行悬停追踪"
      description="hover 事件在进入和离开行时触发，第二参数为 TableRow 或 null，可用来联动外部高亮"
      :state="hovered"
      aside-label="hovered"
    >
      <MDataTable
        row-key="id"
        :columns="columns"
        :data="data"
        bordered
        :ui="{ root: 'max-h-[50vh]' }"
        @hover="onHover"
      />
    </Showcase>

    <Showcase
      title="行右键菜单"
      description="row-contextmenu 拦截右键事件，回调入参包含原始 MouseEvent 与目标行，可阻止默认菜单并弹出自定义操作"
      :state="contextmenuLog.entries.value"
      aside-label="row-contextmenu 日志"
    >
      <MDataTable
        row-key="id"
        :columns="columns"
        :data="data"
        bordered
        :ui="{ root: 'max-h-[50vh]' }"
        @row-contextmenu="onRowContextmenu"
      />
    </Showcase>

    <Showcase
      title="编程式控制行操作"
      description="通过模板 ref 拿到组件实例，调用 clearSelection 清空选中、scrollToTop 滚回顶部"
    >
      <template #toolbar>
        <UButton size="xs" variant="soft" icon="i-lucide-eraser" @click="callClearSelection">
          清空选中
        </UButton>
        <UButton size="xs" variant="soft" icon="i-lucide-arrow-up-to-line" @click="callScrollToTop">
          回到顶部
        </UButton>
      </template>
      <template #aside>
        <StateViewer :state="exposedSelection" label="rowSelection" />
      </template>

      <MDataTable
        ref="tableRef"
        v-model:row-selection="exposedSelection"
        row-key="id"
        :columns="[{ type: 'selection' }, ...columns]"
        :data="data"
        select-on-row-click
        bordered
        :ui="{ root: 'max-h-[40vh]' }"
      />
    </Showcase>
  </div>
</template>
