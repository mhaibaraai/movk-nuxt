<script setup lang="ts">
import type { ColumnSizingState } from '#movk/types/data-table'

const { users, sizingColumns } = useTableExamples()

const columnSizing = ref<ColumnSizingState>({})

const sizingText = computed(() => JSON.stringify(columnSizing.value, null, 2))
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Column Sizing
      </h2>
      <p class="text-sm text-muted">
        演示列宽拖拽与 <code>v-model:column-sizing</code>，可直接观察当前列宽状态。
      </p>
    </div>

    <MDataTable
      v-model:column-sizing="columnSizing"
      :data="users"
      :columns="sizingColumns"
      resizable
      bordered
    />

    <pre class="text-xs p-3 rounded bg-elevated/50 overflow-auto">{{ sizingText }}</pre>
  </div>
</template>
