<script setup lang="ts">
const { users, sortingColumns } = useTableExamples()
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Column Toggle
      </h2>
      <p class="text-sm text-muted">
        演示列显隐切换，<code>visible: false</code> 的列可在菜单中开启。
      </p>
    </div>

    <MDataTable
      :data="users"
      :columns="sortingColumns"
      column-toggle
      bordered
    />
  </div>
</template>
