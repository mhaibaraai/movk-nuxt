<script setup lang="ts">
const { users, selectionColumns } = useTableExamples()

const selectedKeys = ref<(string | number)[]>([])
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
      v-model:selected-keys="selectedKeys"
      :data="users"
      :columns="selectionColumns"
      stripe
      @selection-change="(rows) => console.log('已选', rows)"
    />

    <p v-if="selectedKeys.length > 0" class="text-sm text-muted">
      已选 ID：{{ selectedKeys.join('、') }}
    </p>
  </div>
</template>
