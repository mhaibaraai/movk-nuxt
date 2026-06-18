<script setup lang="ts">
import type { DataTableColumn, DataTableExposed, DataTableProps, DataTableSelectionColumn } from '@movk/nuxt'
import type { Person } from '../../composables/useMockData'

const treeData = makePeopleTree(3, 3, 3)

// 1. 树形数据基础
const baseColumns: DataTableColumn<Person>[] = [
  { type: 'expand' },
  { accessorKey: 'name', header: '成员', size: 200 },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' },
  // 父级节点 level 为空，由 emptyCell 渲染占位符
  { accessorKey: 'level', header: '职级', emptyCell: '—' }
]

// 2. 级联选择策略
const strategy = ref<DataTableSelectionColumn['strategy']>('cascade')
const strategyColumns = computed<DataTableColumn<Person>[]>(() => [
  { type: 'selection', strategy: strategy.value },
  { type: 'expand' },
  { accessorKey: 'name', header: '成员', size: 200 },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
])

// 3. 单选与多选
const mode = ref<DataTableSelectionColumn['mode']>('multiple')
const modeColumns = computed<DataTableColumn<Person>[]>(() => [
  // single 不级联子行，multiple 配合 cascade 联动
  { type: 'selection', mode: mode.value, strategy: mode.value === 'single' ? 'isolated' : 'cascade' },
  { type: 'expand' },
  { accessorKey: 'name', header: '成员', size: 200 },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
])

// 4. 选中结果读取
const resultRef = useTemplateRef<DataTableExposed<Person>>('resultRef')
const selectionKeys = ref<string[]>([])
const resultColumns: DataTableColumn<Person>[] = [
  { type: 'selection', strategy: 'cascade' },
  { type: 'expand' },
  { accessorKey: 'name', header: '成员', size: 200 },
  { accessorKey: 'department', header: '部门' }
]
const names = (rows: Person[]) => rows.map(p => p.name)
const treeSelectionState = computed(() => {
  const result = resultRef.value?.treeSelection
  if (!result) return {}
  return {
    leaves: names(result.leaves),
    parents: names(result.parents),
    halfSelected: names(result.halfSelected),
    strictlyChecked: names(result.strictlyChecked)
  }
})

// 5. 树形缩进
const indentMode = ref<'default' | 'number' | 'string' | 'fn'>('default')
const indentSize = computed<DataTableProps<Person>['indentSize']>(() => {
  if (indentMode.value === 'default') return '1rem'
  if (indentMode.value === 'number') return 36
  if (indentMode.value === 'string') return '2.5rem'
  return ctx => `${(ctx.row.depth + 1) * 1.25}rem`
})
const indentColumns: DataTableColumn<Person>[] = [
  { type: 'expand' },
  { accessorKey: 'name', header: '成员', size: 200 },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]

// 6. 默认展开
const defaultExpandMode = ref<'all' | 'depth1' | 'depth2' | 'fn'>('all')
const defaultExpanded = computed<DataTableProps<Person>['defaultExpanded']>(() => {
  if (defaultExpandMode.value === 'depth1') return 1
  if (defaultExpandMode.value === 'depth2') return 2
  if (defaultExpandMode.value === 'fn') return row => row.department === '设计'
  return true
})
const defaultExpandColumns: DataTableColumn<Person>[] = [
  { type: 'expand' },
  { accessorKey: 'name', header: '成员', size: 200 },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]

// 7. 展开行为控制
const expandRef = useTemplateRef<DataTableExposed<Person>>('expandRef')
const expandOnRowClick = ref(false)
const expandedKeys = ref<string[]>([])
const expandColumns: DataTableColumn<Person>[] = [
  {
    type: 'expand',
    buttonProps: ctx => ({
      icon: ctx.isExpanded ? 'i-lucide-folder-open' : 'i-lucide-folder',
      color: ctx.isExpanded ? 'primary' : 'neutral',
      variant: 'soft'
    }),
    toggleAllButtonProps: ctx => ({
      icon: ctx.isAllExpanded ? 'i-lucide-chevrons-down-up' : 'i-lucide-chevrons-up-down',
      variant: 'soft',
      color: 'primary'
    })
  },
  { accessorKey: 'name', header: '成员', size: 200 },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-6">
    <Showcase
      title="树形数据基础"
      description="childrenKey 识别层级、rowKey 派生行 id、expand 列渲染折叠按钮、父级职级为空时由 emptyCell 占位"
    >
      <MDataTable
        :data="treeData"
        :columns="baseColumns"
        children-key="children"
        row-key="id"
        bordered
        :ui="{ root: 'max-h-[50vh]' }"
      />
    </Showcase>

    <Showcase
      title="级联选择策略"
      description="selection 列 strategy 取 cascade、isolated、leaf 分别决定父子勾选联动方式"
      :state="{ strategy }"
    >
      <template #toolbar>
        <USelect
          v-model="strategy"
          :items="[
            { label: 'cascade 父子级联', value: 'cascade' },
            { label: 'isolated 父子独立', value: 'isolated' },
            { label: 'leaf 仅叶子可勾', value: 'leaf' }
          ]"
          value-key="value"
          size="xs"
          class="w-56"
        />
      </template>

      <MDataTable
        :data="treeData"
        :columns="strategyColumns"
        children-key="children"
        row-key="id"
        bordered
      />
    </Showcase>

    <Showcase
      title="单选与多选"
      description="selection 列 mode 取 single 时整树仅单行勾选、multiple 时配合 strategy 联动"
      :state="{ mode }"
    >
      <template #toolbar>
        <USwitch
          :model-value="mode === 'single'"
          label="single 单选"
          @update:model-value="mode = $event ? 'single' : 'multiple'"
        />
      </template>

      <MDataTable
        :data="treeData"
        :columns="modeColumns"
        children-key="children"
        row-key="id"
        bordered
      />
    </Showcase>

    <Showcase
      title="选中结果读取"
      description="v-model:rowSelectionKeys 双向同步、treeSelection 暴露 leaves、parents、halfSelected、strictlyChecked"
      :state="{ selectionKeys, ...treeSelectionState }"
    >
      <template #toolbar>
        <UButton size="xs" variant="soft" @click="resultRef?.clearSelection()">
          清空选中
        </UButton>
      </template>

      <MDataTable
        ref="resultRef"
        v-model:row-selection-keys="selectionKeys"
        :data="treeData"
        :columns="resultColumns"
        children-key="children"
        row-key="id"
        bordered
      />
    </Showcase>

    <Showcase
      title="树形缩进"
      description="indentSize 支持字符串、数字与函数形态，函数形态可按 row.depth 等上下文动态调整"
    >
      <template #toolbar>
        <USelect
          v-model="indentMode"
          :items="[
            { label: '默认 1rem', value: 'default' },
            { label: '数字 36 (px)', value: 'number' },
            { label: '字符串 2.5rem', value: 'string' },
            { label: '函数按层级', value: 'fn' }
          ]"
          value-key="value"
          size="xs"
          class="w-56"
        />
      </template>

      <MDataTable
        :default-expanded="1"
        :data="treeData"
        :columns="indentColumns"
        children-key="children"
        row-key="id"
        :indent-size="indentSize"
        bordered
      />
    </Showcase>

    <Showcase
      title="默认展开"
      description="defaultExpanded 在未受控时决定初始展开：true 展开全部父级行、数字按 depth 展开、函数按行与深度自定义"
      :state="{ defaultExpandMode }"
    >
      <template #toolbar>
        <USelect
          v-model="defaultExpandMode"
          :items="[
            { label: 'true 全部父级', value: 'all' },
            { label: '数字 1 一级', value: 'depth1' },
            { label: '数字 2 两级', value: 'depth2' },
            { label: '函数 仅设计部门', value: 'fn' }
          ]"
          value-key="value"
          size="xs"
          class="w-56"
        />
      </template>

      <MDataTable
        :key="defaultExpandMode"
        :default-expanded="defaultExpanded"
        :data="treeData"
        :columns="defaultExpandColumns"
        children-key="children"
        row-key="id"
        bordered
        class="max-h-150"
      />
    </Showcase>

    <Showcase
      title="展开行为控制"
      description="默认 plus/minus 折叠图标、buttonProps 与 toggleAllButtonProps 分别定制 cell 与 header、expandOnRowClick 整行触发、expandToDepth 按层展开"
      :state="{ expandedKeys }"
    >
      <template #toolbar>
        <USwitch v-model="expandOnRowClick" label="expandOnRowClick" />
        <UButton size="xs" variant="soft" @click="expandRef?.expandToDepth(1)">
          展开 1 级
        </UButton>
        <UButton size="xs" variant="soft" @click="expandRef?.expandToDepth(2)">
          展开 2 级
        </UButton>
        <UButton size="xs" variant="soft" @click="expandRef?.collapseAll()">
          收起全部
        </UButton>
      </template>

      <MDataTable
        ref="expandRef"
        v-model:expanded-keys="expandedKeys"
        :data="treeData"
        :columns="expandColumns"
        children-key="children"
        row-key="id"
        :expand-on-row-click="expandOnRowClick"
        bordered
      />
    </Showcase>
  </div>
</template>
