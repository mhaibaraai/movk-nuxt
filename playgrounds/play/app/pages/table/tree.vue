<script setup lang="ts">
const { treeData, treeColumns } = useTableExamples()
const indentSize = ref(24)
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Tree
      </h2>
      <p class="text-sm text-muted">
        演示树形数据展示、展开列、默认展开、缩进宽度与行点击展开。
      </p>
    </div>

    <UFormField label="缩进宽度（indentSize）">
      <USlider v-model="indentSize" :min="12" :max="40" :step="2" />
    </UFormField>

    <MDataTable
      :data="treeData"
      :columns="treeColumns"
      children-key="children"
      row-key="id"
      default-expand-all
      expand-on-row-click
      :indent-size="indentSize"
    >
      <template #expand-icon="{ expanded }">
        <UIcon
          :name="expanded ? 'i-lucide-folder-open' : 'i-lucide-folder'"
          class="size-4"
        />
      </template>
    </MDataTable>
  </div>
</template>
