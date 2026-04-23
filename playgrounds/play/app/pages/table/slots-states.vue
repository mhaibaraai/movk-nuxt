<script setup lang="ts">
import type { PaginationState } from '@tanstack/vue-table'

const { users, sortingColumns } = useTableExamples()

const loading = ref(false)
const showData = ref(true)
const sticky = ref(true)
const virtualize = ref(true)
const pagination = ref<PaginationState>({
  pageIndex: 0,
  pageSize: 3
})

const displayData = computed(() => (showData.value ? users : []))

function toggleLoading() {
  loading.value = !loading.value
}

function toggleData() {
  showData.value = !showData.value
  pagination.value = {
    ...pagination.value,
    pageIndex: 0
  }
}
</script>

<template>
  <div class="space-y-4 overflow-auto p-6">
    <div>
      <h2 class="mb-1 text-xl font-semibold">
        DataTable / Slots & States
      </h2>
      <p class="text-sm text-muted">
        演示 <code>loading</code>、<code>empty</code>、<code>sticky</code>、<code>virtualize</code>、<code>ui</code>，
        以及新的 <code>#pagination</code> 插槽。
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <UButton color="neutral" variant="soft" @click="toggleLoading">
        {{ loading ? '停止 Loading' : '开启 Loading' }}
      </UButton>
      <UButton color="neutral" variant="ghost" @click="toggleData">
        {{ showData ? '切换为空数据' : '恢复数据' }}
      </UButton>
      <UCheckbox v-model="sticky" label="sticky" />
      <UCheckbox v-model="virtualize" label="virtualize" />
    </div>

    <MDataTable
      v-model:pagination="pagination"
      :data="displayData"
      :columns="sortingColumns"
      :loading="loading"
      empty="当前没有数据（empty prop）"
      :sticky="sticky"
      :virtualize="virtualize"
      :ui="{}"
      :pagination-ui="{
        pageSizes: [3, 5, 10],
        paginationProps: {
          showControls: true,
          showEdges: true
        }
      }"
    >
      <template #caption>
        <span class="text-xs text-muted">Caption Slot：这是一个带完整状态插槽的示例表格。</span>
      </template>

      <template #body-top>
        <tr>
          <td :colspan="sortingColumns.length" class="p-2 text-xs text-primary">
            Body Top Slot：位于 tbody 顶部
          </td>
        </tr>
      </template>

      <template #body-bottom>
        <tr>
          <td :colspan="sortingColumns.length" class="p-2 text-xs text-primary">
            Body Bottom Slot：位于 tbody 底部
          </td>
        </tr>
      </template>

      <template #loading>
        <div class="py-6 text-center text-sm text-muted">
          Loading Slot：正在加载中...
        </div>
      </template>

      <template #empty>
        <div class="py-6 text-center text-sm text-muted">
          Empty Slot：暂无匹配数据
        </div>
      </template>

      <template #pagination="{ rowCount, selectedCount, from, to, pageCount, pagination: state }">
        <div class="flex flex-col gap-2 px-2 py-3 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <span>
            Pagination Slot：第 {{ state.pageIndex + 1 }} / {{ pageCount }} 页，显示 {{ from }}-{{ to }}，总计 {{ rowCount }} 条
          </span>
          <span>selected={{ selectedCount }}</span>
        </div>
      </template>
    </MDataTable>
  </div>
</template>
