<script setup lang="ts">
import type { PaginationState } from '@tanstack/vue-table'
import type { TableUser } from '~/composables/useTableExamples'

const { users, formattingColumns, selectionColumns } = useTableExamples()

const showClientPagination = ref(true)
const clientPagination = ref<PaginationState>({
  pageIndex: 0,
  pageSize: 3
})

const serverPagination = ref<PaginationState>({
  pageIndex: 0,
  pageSize: 5
})

const serverRows = ref<TableUser[]>([])
const serverTotal = ref(0)
const serverLoading = ref(false)
let activeRequestId = 0

async function mockFetchUsers(pageIndex: number, pageSize: number) {
  await new Promise(resolve => setTimeout(resolve, 450))

  const start = pageIndex * pageSize

  return {
    items: users.slice(start, start + pageSize),
    rowCount: users.length
  }
}

watch(
  () => [serverPagination.value.pageIndex, serverPagination.value.pageSize] as const,
  async ([pageIndex, pageSize]) => {
    const requestId = ++activeRequestId
    serverLoading.value = true

    try {
      const result = await mockFetchUsers(pageIndex, pageSize)

      if (requestId !== activeRequestId) return

      serverRows.value = result.items
      serverTotal.value = result.rowCount
    }
    finally {
      if (requestId === activeRequestId) {
        serverLoading.value = false
      }
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="space-y-6 overflow-auto p-6">
    <div>
      <h2 class="mb-1 text-xl font-semibold">
        DataTable / Pagination
      </h2>
      <p class="text-sm text-muted">
        演示新的分页架构：客户端分页使用 <code>v-model:pagination</code> + 完整数据集，服务端分页使用
        <code>paginationOptions.manualPagination</code> + 当前页数据。
      </p>
    </div>

    <UCard>
      <template #header>
        <div class="space-y-2">
          <div class="font-medium">
            客户端分页
          </div>
          <p class="text-sm text-muted">
            使用选择列演示默认分页栏的 <code>showSelectedCount</code>、<code>text</code> 配置和
            <code>#pagination-summary</code> 局部插槽。
          </p>
          <UCheckbox
            v-model="showClientPagination"
            label="显示分页栏（paginationUi.show）"
          />
        </div>
      </template>

      <MDataTable
        v-model:pagination="clientPagination"
        row-key="id"
        :data="users"
        :columns="selectionColumns"
        :pagination-ui="{
          show: showClientPagination,
          showSelectedCount: true,
          pageSizes: [3, 5, 10],
          text: {
            total: '总计',
            item: '项',
            range: '当前显示',
            selected: '已勾选'
          },
          ui: {
            summary: 'rounded-md bg-primary/5 px-2 py-1 text-primary',
            selectedCount: 'rounded bg-primary/10 px-2 py-0.5 font-medium text-primary',
            actions: 'items-center rounded-md border border-default px-2 py-1'
          },
          pageSizeSelectProps: {
            size: 'xs',
            variant: 'soft',
            trailingIcon: 'i-lucide-chevrons-up-down'
          },
          paginationProps: {
            showEdges: true,
            showControls: true,
            siblingCount: 1,
            activeVariant: 'soft'
          }
        }"
      >
        <template #pagination-summary="{ summaryText, selectedText, selectedCount }">
          <span class="text-xs md:text-sm">{{ summaryText }}</span>
          <UBadge
            v-if="selectedCount > 0"
            color="primary"
            variant="soft"
            size="sm"
            class="font-medium"
          >
            {{ selectedText }}
          </UBadge>
        </template>
      </MDataTable>
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-1">
          <div class="font-medium">
            服务端分页
          </div>
          <p class="text-sm text-muted">
            使用异步请求模拟服务端分页，只向表格传入当前页数据，并通过
            <code>#pagination-actions</code> 局部插槽接管右侧操作区。
          </p>
        </div>
      </template>

      <MDataTable
        v-model:pagination="serverPagination"
        row-key="id"
        :data="serverRows"
        :columns="formattingColumns"
        :loading="serverLoading"
        :pagination-options="{
          manualPagination: true,
          rowCount: serverTotal
        }"
        :pagination-ui="{
          pageSizes: [5, 10, 15],
          text: {
            total: '总数',
            item: '条',
            range: '本次返回'
          }
        }"
      >
        <template #pagination-actions="{ page, pageCount, pageSize, pageSizeOptions, setPage, setPageSize, showPageSizeSelect }">
          <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
            <USelect
              v-if="showPageSizeSelect"
              :model-value="pageSize"
              :items="pageSizeOptions"
              size="xs"
              variant="soft"
              class="w-28"
              :disabled="serverLoading"
              @update:model-value="setPageSize"
            />
            <div class="flex items-center gap-2">
              <UButton
                color="neutral"
                variant="soft"
                size="xs"
                :disabled="serverLoading || page <= 1"
                @click="setPage(page - 1)"
              >
                上一页
              </UButton>
              <span class="min-w-32 text-center text-xs text-muted">
                {{ serverLoading ? '请求中...' : '请求完成' }} {{ page }} / {{ pageCount || 1 }}
              </span>
              <UButton
                color="neutral"
                variant="soft"
                size="xs"
                :disabled="serverLoading || page >= pageCount"
                @click="setPage(page + 1)"
              >
                下一页
              </UButton>
            </div>
          </div>
        </template>
      </MDataTable>
    </UCard>
  </div>
</template>
