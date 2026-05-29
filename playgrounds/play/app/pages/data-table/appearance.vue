<script setup lang="ts">
import type { DataTableColumn, DataTableProps, PaginationState, RowSelectionState } from '@movk/nuxt'
import type { Person } from '../../composables/useMockData'
import { UBadge, UIcon } from '#components'

const data = makePeople(8)
const columns: DataTableColumn<Person>[] = [{ type: 'selection', mode: 'multiple' }, ...usePeopleColumns()]

const uiOverride = ref(false)
const customUi: DataTableProps<Person>['ui'] = {
  root: 'rounded-xl shadow-sm',
  th: 'bg-primary/10 text-primary font-semibold',
  td: 'py-3 text-default',
  tbody: 'divide-y divide-default'
}

const paginationUiOverride = ref(false)
const rowSelectionState = ref<RowSelectionState>({ P0002: true })
const paginationState = ref<PaginationState>({ pageIndex: 0, pageSize: 4 })
const customPaginationUi = {
  root: 'border-t border-default pt-3 mt-1',
  summary: 'text-primary font-medium',
  actions: 'gap-4',
  selectedCount: 'text-success'
}

const stripe = ref(true)
const bordered = ref(true)
const customBordered = ref(false)

const density = ref<'compact' | 'normal' | 'comfortable'>('normal')

const truncateBool = ref(true)
const truncateMode = ref<'boolean' | 'number' | 'fn'>('boolean')
const truncateValue = computed<DataTableProps<Person>['truncate']>(() => {
  if (truncateMode.value === 'boolean') return truncateBool.value
  if (truncateMode.value === 'number') return 2
  return ctx => ctx.column.id === 'bio' ? 2 : true
})

const truncateColumns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 90 },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门', size: 80 },
  { accessorKey: 'address', header: '住址', size: 180 },
  { accessorKey: 'bio', header: '简介', size: 240 }
]

const tooltipEnabled = ref(true)

const fitContent = ref(false)
const fitColumns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门', size: 80 },
  { accessorKey: 'level', header: '职级', size: 80 }
]

const emptyColumns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号' },
  { accessorKey: 'name', header: '姓名'},
  { accessorKey: 'address', header: '住址', size: 200 },
  { accessorKey: 'bio', header: '简介', size: 220 }
]
const emptyData: Person[] = makePeople(3).map((p, i) => ({
  ...p,
  bio: i % 2 === 0 ? '' : p.bio,
  address: i % 3 === 0 ? '' : p.address
}))
const emptyVNodeCell: DataTableProps<Person>['emptyCell'] = () =>
  h(UBadge, { color: 'neutral', variant: 'subtle', size: 'sm' }, () => [
    h(UIcon, { name: 'i-lucide-minus', class: 'size-3' }),
    ' 暂无'
  ])

const stickyEnabled = ref(true)

const rowClassFn: DataTableProps<Person>['rowClass'] = row =>
  row.salary > 50000 ? 'bg-primary/5' : ''
const rowStyleFn: DataTableProps<Person>['rowStyle'] = row =>
  row.status === 'leave' ? { fontStyle: 'italic', opacity: '0.7' } : ''
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-6">
    <Showcase
      title="组件样式覆盖"
      description="ui prop 接收 slot class 映射，与主题深度合并以定制 wrapper、root、th、td、tbody 等局部样式"
    >
      <template #toolbar>
        <USwitch v-model="uiOverride" label="自定义 ui" />
      </template>

      <MDataTable
        :data="data"
        :columns="columns"
        :ui="uiOverride ? customUi : {}"
      />
    </Showcase>

    <Showcase
      title="分页样式覆盖"
      description="paginationUi.ui 接收 Pagination 主题 slots，可重写 root、summary、actions、selectedCount 等局部 class"
    >
      <template #toolbar>
        <USwitch v-model="paginationUiOverride" label="自定义 paginationUi.ui" />
      </template>

      <MDataTable
        v-model:row-selection="rowSelectionState"
        v-model:pagination="paginationState"
        :data="data"
        :columns="columns"
        row-key="id"
        :pagination-ui="{
          show: true,
          pageSizes: [4, 8],
          ui: paginationUiOverride ? customPaginationUi : {}
        }"
      />
    </Showcase>

    <Showcase
      title="斑马纹与边框"
      description="stripe 控制偶数行底色、bordered 支持布尔与对象形态，对象形态通过 CSS 变量自定义颜色、宽度、线型"
    >
      <template #toolbar>
        <USwitch v-model="stripe" label="斑马纹" />
        <USwitch v-model="bordered" label="纵向边框" />
        <USwitch v-model="customBordered" label="对象形态边框" />
      </template>

      <MDataTable
        :data="data"
        :columns="columns"
        :stripe="stripe"
        :bordered="customBordered ? { color: 'var(--ui-primary)', width: '2px', style: 'dashed' } : bordered"
      />
    </Showcase>

    <Showcase
      title="视觉密度"
      description="density 切换 compact、normal、comfortable 三档单元格内边距预设"
    >
      <template #toolbar>
        <USelect v-model="density" :items="['compact', 'normal', 'comfortable']" size="xs" class="w-32" />
      </template>

      <MDataTable
        :data="data"
        :columns="columns"
        :density="density"
        bordered
      />
    </Showcase>

    <Showcase
      title="单行截断与 Tooltip"
      description="全表 truncate 支持布尔、数字、函数三种形态，tooltip 在溢出时浮层显示完整文本"
    >
      <template #toolbar>
        <USelect
          v-model="truncateMode"
          :items="[
            { label: '布尔', value: 'boolean' },
            { label: '多行 (2 行)', value: 'number' },
            { label: '函数 (bio 列 2 行其余 1 行)', value: 'fn' }
          ]"
          value-key="value"
          size="xs"
          class="w-56"
        />
        <USwitch v-if="truncateMode === 'boolean'" v-model="truncateBool" label="开启截断" />
        <USwitch v-model="tooltipEnabled" label="溢出 Tooltip" />
      </template>

      <MDataTable
        :data="data"
        :columns="truncateColumns"
        :truncate="truncateValue"
        :tooltip="tooltipEnabled"
      />
    </Showcase>

    <Showcase
      title="内容自适应宽度"
      description="fitContent 让表格宽度由列宽决定，不再撑满父容器，适合工具型紧凑表格"
    >
      <template #toolbar>
        <USwitch v-model="fitContent" label="fitContent" />
      </template>

      <MDataTable
        :data="data.slice(0, 4)"
        :columns="fitColumns"
        :fit-content="fitContent"
        bordered
      />
    </Showcase>

    <Showcase
      title="空值占位"
      description="emptyCell 支持字符串、函数模板与 false，分别用于自定义文本、自定义节点与完全关闭"
    >
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="flex flex-col gap-2">
          <span class="text-xs text-muted">字符串占位 (—)</span>
          <MDataTable :data="emptyData" :columns="emptyColumns" empty-cell="—" bordered />
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-xs text-muted">函数模板 (VNode)</span>
          <MDataTable :data="emptyData" :columns="emptyColumns" :empty-cell="emptyVNodeCell" bordered />
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-xs text-muted">关闭占位 (false)</span>
          <MDataTable :data="emptyData" :columns="emptyColumns" :empty-cell="false" bordered />
        </div>
      </div>
    </Showcase>

    <Showcase
      title="粘性表头"
      description="sticky 默认开启，关闭后表头随内容滚动；需配合受限高度的滚动容器"
    >
      <template #toolbar>
        <USwitch v-model="stickyEnabled" label="sticky 表头" />
      </template>

      <MDataTable
        :data="makePeople(30)"
        :columns="columns"
        :sticky="stickyEnabled"
        bordered
        :ui="{ root: 'max-h-[40vh]' }"
      />
    </Showcase>

    <Showcase
      title="行样式与行类"
      description="rowClass 与 rowStyle 支持字符串或函数，按行数据动态返回 class / style"
    >
      <MDataTable
        :data="data"
        :columns="columns"
        :row-class="rowClassFn"
        :row-style="rowStyleFn"
        bordered
      />
    </Showcase>
  </div>
</template>
