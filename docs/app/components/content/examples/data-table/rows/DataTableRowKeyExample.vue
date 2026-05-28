<script setup lang="ts">
import type { DataTableColumn, RowSelectionState } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const rows = ref<Person[]>(makePeople(6))
const selection = ref<RowSelectionState>({})

const columns: DataTableColumn<Person>[] = [
  { type: 'selection' },
  { accessorKey: 'id', header: '工号', size: 100 },
  { accessorKey: 'name', header: '姓名', size: 110 },
  { accessorKey: 'department', header: '部门', size: 100 }
]

function shuffle(): void {
  rows.value = [...rows.value].sort(() => Math.random() - 0.5)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div>
      <UButton size="xs" variant="soft" icon="i-lucide-shuffle" @click="shuffle">
        打乱数据
      </UButton>
    </div>
    <MDataTable
      v-model:row-selection="selection"
      row-key="id"
      :columns="columns"
      :data="rows"
      bordered
    />
  </div>
</template>
