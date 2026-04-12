<script setup lang="ts">
const { users, basicColumns } = useTableExamples()
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Basic
      </h2>
      <p class="text-sm text-muted">
        最小可运行示例，展示基础列定义与数据渲染。
      </p>
    </div>

    <MDataTable
      class="w-sm"
      fixed-layout
      :columns="basicColumns"
    />
  </div>
</template>
