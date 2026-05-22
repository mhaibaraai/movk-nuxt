<script setup lang="ts">
import type { DataTableColumn, DataTableDensityPreset } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(6)
const density = ref<DataTableDensityPreset>('normal')
const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: '姓名', size: 110 },
  { accessorKey: 'department', header: '部门', size: 90 },
  { accessorKey: 'role', header: '岗位', size: 130 },
  { accessorKey: 'level', header: '职级', size: 90 }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <USelect v-model="density" :items="['compact', 'normal', 'comfortable']" size="xs" class="w-32" />
    <MDataTable :data="data" :columns="columns" :density="density" bordered />
  </div>
</template>
