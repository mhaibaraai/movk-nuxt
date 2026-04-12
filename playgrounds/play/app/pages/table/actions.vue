<script setup lang="ts">
const { users, actionsColumns } = useTableExamples()
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Actions
      </h2>
      <p class="text-sm text-muted">
        演示 <code>actions</code> 列与按行动态隐藏按钮。
      </p>
    </div>

    <MDataTable
      :data="users"
      :columns="actionsColumns"
      bordered
    />
  </div>
</template>
