<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(4)
const fitContent = ref(true)
const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 80 },
  { accessorKey: 'name', header: '姓名', size: 100 },
  { accessorKey: 'department', header: '部门', size: 80 },
  { accessorKey: 'level', header: '职级', size: 80 }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <USwitch v-model="fitContent" label="fitContent" />
    <MDataTable :data="data" :columns="columns" :fit-content="fitContent" bordered />
  </div>
</template>
