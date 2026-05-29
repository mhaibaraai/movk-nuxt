<script setup lang="ts">
import type { DataTableColumn, DataTableContextmenuHandler } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)
const toast = useToast()

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]

const onRowContextmenu: DataTableContextmenuHandler<Person> = (e, row) => {
  e.preventDefault()
  toast.add({ title: `右键 ${row.original.name}`, duration: 1500 })
}
</script>

<template>
  <MDataTable
    row-key="id"
    :columns="columns"
    :data="data"
    :ui="{ root: 'max-h-[50vh]' }"
    @row-contextmenu="onRowContextmenu"
  />
</template>
