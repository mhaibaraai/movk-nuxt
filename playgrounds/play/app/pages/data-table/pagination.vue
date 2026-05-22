<script setup lang="ts">
import type { PaginationState, RowSelectionState, SortingState } from '@movk/nuxt'
import type { Person } from '../../composables/useMockData'

const columns = usePeopleColumns()

function fetchPeople(buildParams: () => Record<string, string>) {
  const url = computed(() => `/api/people?${new URLSearchParams(buildParams()).toString()}`)
  const res = useApiFetch<{ items: Person[], total: number }>(() => url.value, { watch: [url] })
  const items = computed<Person[]>(() => res.data.value?.items ?? [])
  const total = computed(() => res.data.value?.total ?? 0)
  return { items, total, pending: res.pending, refresh: res.refresh }
}

// 1. 客户端自动分页
const clientData = makePeople(80)
const clientPagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 })

// 2. 服务端手动分页（rowCount 形态）
const serverPagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 })
const sorting = ref<SortingState>([])
const keyword = ref('')
const server = fetchPeople(() => {
  const sort = sorting.value[0]
  return {
    page: String(serverPagination.value.pageIndex + 1),
    pageSize: String(serverPagination.value.pageSize),
    keyword: keyword.value,
    ...(sort && { sortBy: sort.id, sortDir: sort.desc ? 'desc' : 'asc' })
  }
})

// 3. 手动分页页数形态（pageCount）
const countPagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 })
const countQuery = fetchPeople(() => ({
  page: String(countPagination.value.pageIndex + 1),
  pageSize: String(countPagination.value.pageSize)
}))
const countPageCount = computed(() => Math.ceil(countQuery.total.value / countPagination.value.pageSize))

// 4. 每页条数切换
const sizePagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 })
const sizeQuery = fetchPeople(() => ({
  page: String(sizePagination.value.pageIndex + 1),
  pageSize: String(sizePagination.value.pageSize)
}))

// 5. 分页摘要与文案
const summaryPagination = ref<PaginationState>({ pageIndex: 0, pageSize: 10 })
const summarySelection = ref<RowSelectionState>({})
const summaryQuery = fetchPeople(() => ({
  page: String(summaryPagination.value.pageIndex + 1),
  pageSize: String(summaryPagination.value.pageSize)
}))

// 6. 透传分页组件
const passthroughPagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 })
const passthroughQuery = fetchPeople(() => ({
  page: String(passthroughPagination.value.pageIndex + 1),
  pageSize: String(passthroughPagination.value.pageSize)
}))

// 7. 分页栏内部槽位
const slotPagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 })
const slotQuery = fetchPeople(() => ({
  page: String(slotPagination.value.pageIndex + 1),
  pageSize: String(slotPagination.value.pageSize)
}))

// 8. 整条替换分页栏
const fullPagination = ref<PaginationState>({ pageIndex: 0, pageSize: 5 })
const fullQuery = fetchPeople(() => ({
  page: String(fullPagination.value.pageIndex + 1),
  pageSize: String(fullPagination.value.pageSize)
}))
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <Showcase
      title="客户端自动分页"
      description="传入 v-model:pagination 即触发自动分页，组件在本地切片数据并渲染默认分页栏。"
    >
      <MDataTable
        v-model:pagination="clientPagination"
        :data="clientData"
        :columns="columns"
        bordered
        :ui="{ root: 'max-h-[60vh]' }"
      />
    </Showcase>

    <Showcase
      title="服务端手动分页"
      description="paginationOptions 设 manualPagination 与 rowCount 接管分页，搜索重置 pageIndex、manualSorting 排序、refresh 刷新由 loading 反馈。"
    >
      <template #toolbar>
        <UInput
          v-model="keyword"
          size="sm"
          placeholder="搜索姓名、邮箱、岗位"
          icon="i-lucide-search"
          @update:model-value="serverPagination.pageIndex = 0"
        />
        <UButton
          size="sm"
          variant="outline"
          icon="i-lucide-refresh-cw"
          :loading="server.pending.value"
          @click="() => server.refresh()"
        >
          刷新
        </UButton>
      </template>

      <MDataTable
        v-model:pagination="serverPagination"
        v-model:sorting="sorting"
        :data="server.items.value"
        :columns="columns"
        :loading="server.pending.value"
        sortable
        bordered
        :pagination-options="{ manualPagination: true, rowCount: server.total.value }"
        :sorting-options="{ manualSorting: true }"
        :ui="{ root: 'max-h-[60vh]' }"
      />
    </Showcase>

    <Showcase
      title="手动分页页数形态"
      description="手动分页改用 paginationOptions.pageCount 直接指定总页数，适用于后端只返回页数而非总条数的场景。"
    >
      <MDataTable
        v-model:pagination="countPagination"
        :data="countQuery.items.value"
        :columns="columns"
        :loading="countQuery.pending.value"
        bordered
        :pagination-options="{ manualPagination: true, pageCount: countPageCount }"
        :ui="{ root: 'max-h-[60vh]' }"
      />
    </Showcase>

    <Showcase
      title="每页条数切换"
      description="paginationUi.pageSizes 长度大于 1 时显示每页条数切换器，切换 pageSize 触发重新请求。"
    >
      <MDataTable
        v-model:pagination="sizePagination"
        :data="sizeQuery.items.value"
        :columns="columns"
        :loading="sizeQuery.pending.value"
        bordered
        :pagination-options="{ manualPagination: true, rowCount: sizeQuery.total.value }"
        :pagination-ui="{ pageSizes: [5, 10, 20, 50] }"
        :ui="{ root: 'max-h-[60vh]' }"
      />
    </Showcase>

    <Showcase
      title="分页摘要与文案"
      description="v-model:rowSelection 配合 rowKey 联动 selectedCount，paginationUi 的 showSelectedCount、showRowRange、text 控制摘要区显示与文案。"
    >
      <MDataTable
        v-model:pagination="summaryPagination"
        v-model:row-selection="summarySelection"
        :data="summaryQuery.items.value"
        :columns="columns"
        :loading="summaryQuery.pending.value"
        row-key="id"
        select-on-row-click
        bordered
        :pagination-options="{ manualPagination: true, rowCount: summaryQuery.total.value }"
        :pagination-ui="{
          showSelectedCount: true,
          showRowRange: true,
          text: { total: '总计', item: '人', range: '当前', selected: '勾选' }
        }"
        :ui="{ root: 'max-h-[60vh]' }"
      />
    </Showcase>

    <Showcase
      title="透传分页组件"
      description="paginationUi.paginationProps 透传 UPagination 的 showEdges、siblingCount，pageSizeSelectProps 透传每页条数选择器属性。"
    >
      <MDataTable
        v-model:pagination="passthroughPagination"
        :data="passthroughQuery.items.value"
        :columns="columns"
        :loading="passthroughQuery.pending.value"
        bordered
        :pagination-options="{ manualPagination: true, rowCount: passthroughQuery.total.value }"
        :pagination-ui="{
          pageSizes: [5, 10, 20],
          paginationProps: { showEdges: true, siblingCount: 1, color: 'success' },
          pageSizeSelectProps: { size: 'sm', variant: 'subtle' }
        }"
        :ui="{ root: 'max-h-[60vh]' }"
      />
    </Showcase>

    <Showcase
      title="分页栏内部槽位"
      description="pagination-summary 与 pagination-actions 槽位分别替换摘要区与操作区，paginationUi.show 控制分页栏整体显隐。"
    >
      <MDataTable
        v-model:pagination="slotPagination"
        :data="slotQuery.items.value"
        :columns="columns"
        :loading="slotQuery.pending.value"
        bordered
        :pagination-options="{ manualPagination: true, rowCount: slotQuery.total.value }"
        :pagination-ui="{ show: true }"
        :ui="{ root: 'max-h-[60vh]' }"
      >
        <template #pagination-summary="{ page, pageCount, rowCount }">
          <span class="text-sm text-muted">
            第 {{ page }} / {{ pageCount }} 页，共 {{ rowCount }} 条
          </span>
        </template>

        <template #pagination-actions="{ page, pageCount, setPage }">
          <UButton size="xs" variant="ghost" icon="i-lucide-chevron-left" :disabled="page <= 1" @click="setPage(page - 1)" />
          <UButton size="xs" variant="ghost" icon="i-lucide-chevron-right" :disabled="page >= pageCount" @click="setPage(page + 1)" />
        </template>
      </MDataTable>
    </Showcase>

    <Showcase
      title="整条替换分页栏"
      description="pagination 槽位接收 paginationView 完整状态，整条替换默认分页栏并自定义布局。"
    >
      <MDataTable
        v-model:pagination="fullPagination"
        :data="fullQuery.items.value"
        :columns="columns"
        :loading="fullQuery.pending.value"
        bordered
        :pagination-options="{ manualPagination: true, rowCount: fullQuery.total.value }"
        :ui="{ root: 'max-h-[60vh]' }"
      >
        <template #pagination="{ page, pageCount, from, to, setPage }">
          <div class="flex items-center justify-between rounded-md border border-default px-3 py-2">
            <span class="text-sm text-muted">显示 {{ from }}-{{ to }}</span>
            <div class="flex items-center gap-2">
              <UButton size="xs" variant="soft" :disabled="page <= 1" @click="setPage(page - 1)">
                上一页
              </UButton>
              <span class="text-sm tabular-nums">{{ page }} / {{ pageCount }}</span>
              <UButton size="xs" variant="soft" :disabled="page >= pageCount" @click="setPage(page + 1)">
                下一页
              </UButton>
            </div>
          </div>
        </template>
      </MDataTable>
    </Showcase>
  </div>
</template>
