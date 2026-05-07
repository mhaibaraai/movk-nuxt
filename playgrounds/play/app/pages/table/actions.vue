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
        演示 actions 列：动态 buttonProps、异步 loading、溢出菜单、全局 actionButtonProps 透传。
      </p>
    </div>

    <MDataTable
      :data="users"
      :columns="actionsColumns"
      :action-button-props="{ variant: 'ghost', size: 'xs' }"
      bordered
    />
  </div>
</template>
