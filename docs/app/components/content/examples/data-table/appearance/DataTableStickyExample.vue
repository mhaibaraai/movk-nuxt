<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const stickyEnabled = ref(true)
const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名', size: 110 },
  { accessorKey: 'department', header: '部门', size: 90 },
  { accessorKey: 'role', header: '岗位', size: 130 },
  { accessorKey: 'level', header: '职级', size: 90 }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <USwitch v-model="stickyEnabled" label="sticky 表头" />
    <MDataTable
      :data="makePeople(30)"
      :columns="columns"
      :sticky="stickyEnabled"
      bordered
      :ui="{ root: 'max-h-[40vh]' }"
    />
  </div>
</template>
