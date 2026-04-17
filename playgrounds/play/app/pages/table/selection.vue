<script setup lang="ts">
import type { RowSelectionState } from '@tanstack/vue-table'

const { users, selectionColumns } = useTableExamples()

const rowSelection = ref<RowSelectionState>({
  王五: true
})
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Selection
      </h2>
      <p class="text-sm text-muted">
        演示多选列、序号列和 <code>v-model:selected-keys</code>。
      </p>
    </div>

    <MDataTable
      v-model:row-selection="rowSelection"
      :data="users"
      row-key="name"
      :columns="selectionColumns"
      stripe
    />

    <p class="text-sm text-muted">
      {{ rowSelection }}
    </p>
  </div>
</template>
