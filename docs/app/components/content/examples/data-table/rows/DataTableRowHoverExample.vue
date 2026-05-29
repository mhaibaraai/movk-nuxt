<script setup lang="ts">
import type { DataTableColumn, DataTableHoverHandler } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)
const hovered = ref<string | null>(null)

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]

const onHover: DataTableHoverHandler<Person> = (_e, row) => {
  hovered.value = row ? row.original.name : null
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <p class="text-xs text-muted">
      悬停行：{{ hovered ?? '（无）' }}
    </p>
    <MDataTable row-key="id" :columns="columns" :data="data" :ui="{ root: 'max-h-[50vh]' }" @hover="onHover" />
  </div>
</template>
