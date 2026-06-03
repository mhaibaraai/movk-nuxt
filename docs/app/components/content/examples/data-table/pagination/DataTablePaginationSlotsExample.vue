<script setup lang="ts">
import type { DataTableColumn, PaginationState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(40)
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 })
const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]
</script>

<template>
  <MDataTable
    v-model:pagination="pagination"
    :data="data"
    :columns="columns"
    :pagination-ui="{ show: true }"
    :ui="{ root: 'max-h-[60vh]' }"
  >
    <template #pagination-summary="{ page, pageCount, rowCount }">
      <span class="text-sm text-muted">
        第 {{ page }} / {{ pageCount }} 页，共 {{ rowCount }} 条
      </span>
    </template>
    <template #pagination-actions="{ page, pageCount, setPage }">
      <UButton size="xs" variant="ghost" icon="i-lucide-chevron-left" :disabled="page <= 1" @click="setPage(page - 1)" />
      <UButton size="xs" variant="ghost" icon="i-lucide-chevron-right" :disabled="page >= pageCount" @click="setPage(page + 1)" />
    </template>
  </MDataTable>
</template>
