<script setup lang="ts">
import type { DataTableColumn } from '#movk/types/data-table/columns'
import type { Person } from '../../composables/useMockData'

const data = makePeople(12)
const log = ref<string[]>([])
function record(msg: string) {
  log.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...log.value].slice(0, 8)
}

const columns: DataTableColumn<Person>[] = [
  { type: 'selection', mode: 'multiple' },
  { type: 'index' },
  { type: 'row-pinning' },
  { accessorKey: 'name', header: '姓名', size: 120 },
  { accessorKey: 'department', header: '部门', size: 100 },
  { accessorKey: 'role', header: '岗位', size: 160 },
  {
    type: 'actions',
    header: '操作',
    maxInline: 2,
    actions: [
      {
        key: 'view',
        buttonProps: { icon: 'i-lucide-eye', variant: 'ghost', size: 'xs' },
        onClick: ({ row }) => record(`view ${row.name}`)
      },
      {
        key: 'edit',
        buttonProps: { icon: 'i-lucide-pencil', variant: 'ghost', size: 'xs' },
        onClick: async ({ row }) => {
          await new Promise(r => setTimeout(r, 600))
          record(`edit ${row.name} done`)
        }
      },
      {
        key: 'archive',
        buttonProps: { icon: 'i-lucide-archive', variant: 'ghost', size: 'xs', label: '归档' },
        onClick: ({ row }) => record(`archive ${row.name}`)
      },
      {
        key: 'delete',
        buttonProps: { icon: 'i-lucide-trash-2', variant: 'ghost', size: 'xs', color: 'error', label: '删除' },
        confirm: true,
        confirmProps: ({ row }) => ({
          type: 'error',
          title: `删除 ${row.name}？`,
          description: '该操作不可恢复',
          confirmText: '删除'
        }),
        onClick: ({ row }) => record(`deleted ${row.name}`)
      }
    ]
  }
]

const rowSelection = ref<Record<string, boolean>>({})
const rowPinning = ref<{ top?: string[], bottom?: string[] }>({})
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
    <Showcase
      title="特殊列类型"
      description="selection · index · expand · row-pinning · actions(maxInline=2 折叠 + 确认弹窗)"
    >
      <MDataTable
        v-model:row-selection="rowSelection"
        v-model:row-pinning="rowPinning"
        row-key="id"
        :columns="columns"
        :data="data"
        bordered
        stripe
        :ui="{ root: 'max-h-[60vh]' }"
      />
    </Showcase>

    <div class="flex flex-col gap-2">
      <StateViewer :state="rowSelection" label="rowSelection" />
      <StateViewer :state="rowPinning" label="rowPinning" />
      <StateViewer :state="log" label="action 日志" />
    </div>
  </div>
</template>
