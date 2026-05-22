<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(6)
const stripe = ref(true)
const bordered = ref(true)
const customBordered = ref(false)
const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名', size: 110 },
  { accessorKey: 'department', header: '部门', size: 90 },
  { accessorKey: 'role', header: '岗位', size: 130 },
  { accessorKey: 'level', header: '职级', size: 90 }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap gap-3">
      <USwitch v-model="stripe" label="斑马纹" />
      <USwitch v-model="bordered" label="纵向边框" />
      <USwitch v-model="customBordered" label="对象形态边框" />
    </div>
    <MDataTable
      :data="data"
      :columns="columns"
      :stripe="stripe"
      :bordered="customBordered ? { color: 'var(--ui-primary)', width: '2px', style: 'dashed' } : bordered"
    />
  </div>
</template>
