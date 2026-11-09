<script setup lang="ts">
import type { DataTableColumn, RowPinningState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)
const pinning = ref<RowPinningState>({ top: ['P0001'], bottom: ['P0008'] })

const columns: DataTableColumn<Person>[] = [
  {
    type: 'row-pinning',
    position: 'top',
    buttonProps: ({ pinned }) => pinned
      ? { icon: 'i-lucide-pin-off', color: 'primary', variant: 'soft' }
      : { icon: 'i-lucide-pin', color: 'neutral', variant: 'ghost' }
  },
  { accessorKey: 'id', header: '工号' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <MDataTable v-model:row-pinning="pinning" row-key="id" :columns="columns" :data="data" :ui="{ root: 'max-h-72' }" />
    <pre class="text-xs p-3 rounded-md bg-tint overflow-auto">rowPinning: {{ pinning }}</pre>
  </div>
</template>
