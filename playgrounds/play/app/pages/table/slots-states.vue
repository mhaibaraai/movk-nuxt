<script setup lang="ts">
const { users, sortingColumns } = useTableExamples()

const loading = ref(false)
const showData = ref(true)
const sticky = ref(true)
const virtualize = ref(true)
const page = ref(1)
const pageSize = ref(3)

const displayData = computed(() => (showData.value ? users : []))

function toggleLoading() {
  loading.value = !loading.value
}

function toggleData() {
  showData.value = !showData.value
  page.value = 1
}
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Slots & States
      </h2>
      <p class="text-sm text-muted">
        演示 <code>loading</code>、<code>empty</code>、<code>sticky</code>、<code>virtualize</code>、<code>ui</code>，以及工具栏、表尾、分页左右等插槽。
      </p>
    </div>

    <div class="flex items-center gap-3 flex-wrap">
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
      :data="displayData"
      :columns="sortingColumns"
      :loading="loading"
      empty="当前没有数据（empty prop）"
      :sticky="sticky"
      :virtualize="virtualize"
      :ui="{}"
      :total="displayData.length"
      :page="page"
      :page-size="pageSize"
      :page-sizes="[3, 5, 10]"
      :pagination-props="{ showControls: true, showEdges: true }"
      @update:page="page = $event"
      @update:page-size="pageSize = $event"
    >
      <template #toolbar="{ selectedRows, clearSelection }">
        <div class="flex items-center gap-2 text-sm text-muted">
          <span>Toolbar Slot：已选 {{ selectedRows.length }} 行</span>
          <UButton size="xs" color="neutral" variant="link" @click="clearSelection">
            清空选择
          </UButton>
        </div>
      </template>

      <template #caption>
        <span class="text-xs text-muted">Caption Slot：这是一个带完整状态插槽的示例表格。</span>
      </template>

      <template #body-top>
        <tr>
          <td :colspan="sortingColumns.length" class="text-xs text-primary p-2">
            Body Top Slot：位于 tbody 顶部
          </td>
        </tr>
      </template>

      <template #body-bottom>
        <tr>
          <td :colspan="sortingColumns.length" class="text-xs text-primary p-2">
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

      <template #pagination-left="{ total, selectedCount }">
        <span class="text-xs text-muted">Left Slot：total={{ total }}，selected={{ selectedCount }}</span>
      </template>

      <template #pagination-right="{ total }">
        <span class="text-xs text-muted">Right Slot：当前总条数 {{ total }}</span>
      </template>

      <template #table-footer="{ data }">
        <div class="text-xs text-muted pt-2">
          Table Footer Slot：当前渲染数据 {{ data.length }} 条
        </div>
      </template>
    </MDataTable>
  </div>
</template>
