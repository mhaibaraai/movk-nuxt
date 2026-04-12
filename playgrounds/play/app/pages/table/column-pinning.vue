<script setup lang="ts">
import type { ColumnPinningState } from '#movk/types/data-table'

const { users, sortingColumns } = useTableExamples()

const columnPinning = ref<ColumnPinningState>({
  left: ['name'],
  right: []
})
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Column Pinning
      </h2>
      <p class="text-sm text-muted">
        演示列固定按钮（左侧 -> 右侧 -> 取消）与 <code>v-model:column-pinning</code> 状态联动。
      </p>
    </div>

    <MDataTable
      v-model:column-pinning="columnPinning"
      :data="users"
      :columns="sortingColumns"
      :pinable="true"
      bordered
    />

    <p class="text-sm text-muted">
      left：{{ columnPinning.left?.join('、') || '无' }}
    </p>
    <p class="text-sm text-muted">
      right：{{ columnPinning.right?.join('、') || '无' }}
    </p>
  </div>
</template>
