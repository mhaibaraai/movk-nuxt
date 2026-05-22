<script setup lang="ts">
import type { DataTableColumn, PaginationState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(40)
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 })
const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 90 },
  { accessorKey: 'name', header: '姓名', size: 110 },
  { accessorKey: 'department', header: '部门', size: 90 },
  { accessorKey: 'role', header: '岗位', size: 130 }
]
</script>

<template>
  <MDataTable
    v-model:pagination="pagination"
    :data="data"
    :columns="columns"
    bordered
    :ui="{ root: 'max-h-[60vh]' }"
  >
    <template #pagination="{ page, pageCount, from, to, setPage }">
      <div class="flex items-center justify-between rounded-md border border-default px-3 py-2">
        <span class="text-sm text-muted">显示 {{ from }}-{{ to }}</span>
        <div class="flex items-center gap-2">
          <UButton size="xs" variant="soft" :disabled="page <= 1" @click="setPage(page - 1)">
            上一页
          </UButton>
          <span class="text-sm tabular-nums">{{ page }} / {{ pageCount }}</span>
          <UButton size="xs" variant="soft" :disabled="page >= pageCount" @click="setPage(page + 1)">
            下一页
          </UButton>
        </div>
      </div>
    </template>
  </MDataTable>
</template>
