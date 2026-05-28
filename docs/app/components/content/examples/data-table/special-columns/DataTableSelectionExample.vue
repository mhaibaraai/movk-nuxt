<script setup lang="ts">
import type { DataTableColumn, RowSelectionState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const props = defineProps<{
  mode: 'multiple' | 'single'
}>()

const data = makePeople(6)
const selection = ref<RowSelectionState>({})

const columns = computed<DataTableColumn<Person>[]>(() => [
  props.mode === 'single'
    ? { type: 'selection', mode: 'single', header: '选择', size: 80 }
    : { type: 'selection' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门', size: 90 },
  { accessorKey: 'role', header: '岗位', size: 120 }
])
</script>

<template>
  <div class="flex flex-col gap-3">
    <MDataTable v-model:row-selection="selection" row-key="id" :columns="columns" :data="data" />
    <pre class="text-xs p-3 rounded-md bg-muted overflow-auto">rowSelection: {{ selection }}</pre>
  </div>
</template>
