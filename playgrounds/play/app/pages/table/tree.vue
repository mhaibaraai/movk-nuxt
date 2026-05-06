<script setup lang="ts">
import type { DataTableColumn } from '#movk/types/data-table'

interface Payment {
  id: string
  amount: number
  email: string
  date: string
  children?: Payment[]
}

const { treeData } = useTableExamples()

const strategy = ref<'cascade' | 'isolated' | 'leaf'>('cascade')
const rowSelectionKeys = ref<string[]>([])
const expandedKeys = ref(['4600'])

const columns = computed(() => [
  { type: 'selection', mode: 'multiple', size: 40, strategy: strategy.value },
  { type: 'expand', buttonProps: ({ isExpanded }) => ({ icon: isExpanded ? 'i-lucide:folder-open' : 'i-lucide:folder' }) },
  { accessorKey: 'date', header: '日期' },
  { accessorKey: 'email', header: '邮箱' },
  { accessorKey: 'amount', header: '金额', align: 'right' }
] as DataTableColumn<Payment>[])

const tableRef = useTemplateRef('tableRef')

// const derived = computed(() => tableRef.value?.treeSelection)

const strategyOptions = [
  { label: 'cascade（父子级联）', value: 'cascade' },
  { label: 'isolated（父子独立）', value: 'isolated' },
  { label: 'leaf（仅叶子可选）', value: 'leaf' }
]
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Tree Selection
      </h2>
      <p class="text-sm text-muted">
        演示树形勾选的三种 strategy 与组件 expose 的 treeSelection 派生分类。
      </p>
    </div>

    <URadioGroup
      v-model="strategy"
      :items="strategyOptions"
      orientation="horizontal"
    />

    <MDataTable
      ref="tableRef"
      :key="strategy"
      v-model:row-selection-keys="rowSelectionKeys"
      v-model:expanded-keys="expandedKeys"
      :data="treeData"
      :columns="columns"
      expand-on-row-click
      children-key="children"
      row-key="id"
    />

    <div class="text-sm space-y-1">
      <div>strategy: {{ strategy }}</div>
      <div>rowSelectionKeys: {{ rowSelectionKeys }}</div>
      <!-- {{ derived }} -->
      <!-- <div>selected({{ derived.selected.length }}): {{ derived.selected.map(r => r.id) }}</div>
      <div>leaves({{ derived.leaves.length }}): {{ derived.leaves.map(r => r.id) }}</div>
      <div>parents({{ derived.parents.length }}): {{ derived.parents.map(r => r.id) }}</div>
      <div>halfSelected({{ derived.halfSelected.length }}): {{ derived.halfSelected.map(r => r.id) }}</div>
      <div>strictlyChecked({{ derived.strictlyChecked.length }}): {{ derived.strictlyChecked.map(r => r.id) }}</div> -->
    </div>
  </div>
</template>
