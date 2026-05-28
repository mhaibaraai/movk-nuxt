<script setup lang="ts">
import type { DataTableColumn, ExpandedState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const data = makePeople(8)
const expanded = ref<ExpandedState>({})

const columns: DataTableColumn<Person>[] = [
  { type: 'expand' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门', size: 90 },
  { accessorKey: 'role', header: '岗位', size: 120 }
]
</script>

<template>
  <MDataTable
    v-model:expanded="expanded"
    row-key="id"
    :columns="columns"
    :data="data"
    bordered
    :ui="{ root: 'max-h-[50vh]' }"
  >
    <template #expanded="{ row }">
      <div class="px-4 py-3 text-sm bg-elevated/30">
        <p>邮箱 {{ row.original.email }} · 入职 {{ row.original.joinedAt }}</p>
        <p class="text-muted">
          {{ row.original.bio }}
        </p>
      </div>
    </template>
  </MDataTable>
</template>
