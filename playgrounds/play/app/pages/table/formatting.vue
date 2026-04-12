<script setup lang="ts">
const { users, formattingColumns } = useTableExamples()
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Formatting
      </h2>
      <p class="text-sm text-muted">
        演示 <code>formatter</code>、<code>emptyCell</code> 与 <code>tooltip</code>。
      </p>
    </div>

    <MDataTable
      class="w-xl"
      :data="users"
      :columns="formattingColumns"
      empty-cell="—"
    />
  </div>
</template>
