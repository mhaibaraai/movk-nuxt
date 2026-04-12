<script setup lang="ts">
import type { RowPinningState } from '#movk/types/data-table'

const { users, pinningColumns } = useTableExamples()

const rowPinning = ref<RowPinningState>({
  top: [],
  bottom: []
})
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Row Pinning
      </h2>
      <p class="text-sm text-muted">
        演示行固定列（图钉按钮）与 <code>v-model:row-pinning</code> 状态联动。
      </p>
    </div>

    <MDataTable
      v-model:row-pinning="rowPinning"
      :data="users"
      :columns="pinningColumns"
      :pinable="true"
      bordered
      stripe
    />

    <p class="text-sm text-muted">
      top：{{ rowPinning.top?.join('、') || '无' }}
    </p>
    <p class="text-sm text-muted">
      bottom：{{ rowPinning.bottom?.join('、') || '无' }}
    </p>
  </div>
</template>
