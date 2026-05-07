<script setup lang="ts">
const { users, sortingColumns } = useTableExamples()
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Sorting
      </h2>
      <p class="text-sm text-muted">
        演示全局排序和列级排序开关。
      </p>
    </div>

    <MDataTable
      :data="users"
      :columns="sortingColumns"
      :sortable="true"
    />
  </div>
</template>
