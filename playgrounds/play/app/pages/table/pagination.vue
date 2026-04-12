<script setup lang="ts">
const { users, sortingColumns } = useTableExamples()

const page = ref(1)
const pageSize = ref(3)
const showPagination = ref(true)

const pagedUsers = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return users.slice(start, start + pageSize.value)
})
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Pagination
      </h2>
      <p class="text-sm text-muted">
        演示分页参数联动：<code>page</code>、<code>pageSize</code>、<code>total</code>、<code>showPagination</code>、<code>paginationProps</code>。
      </p>
    </div>

    <UCheckbox
      v-model="showPagination"
      label="显示分页（showPagination）"
    />

    <MDataTable
      :data="pagedUsers"
      :columns="sortingColumns"
      :total="users.length"
      :page="page"
      :page-size="pageSize"
      :page-sizes="[3, 5, 10]"
      :show-pagination="showPagination"
      :pagination-props="{ showEdges: true, showControls: true, siblingCount: 1 }"
      @update:page="page = $event"
      @update:page-size="pageSize = $event"
    >
      <template #pagination-left="{ total, selectedCount }">
        <span class="text-xs text-muted">总计 {{ total }} 条，已选 {{ selectedCount }} 条</span>
      </template>

      <template #pagination-right="{ total }">
        <span class="text-xs text-muted">右侧插槽（total: {{ total }}）</span>
      </template>
    </MDataTable>
  </div>
</template>
