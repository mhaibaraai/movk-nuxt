<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const PAGE_SIZE = 15
const TOTAL = 60
const items = ref<Person[]>([])
const loaded = ref(0)

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号' },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门' },
  { accessorKey: 'role', header: '岗位' }
]

// 模拟异步分页：每次追加一页，返回 Promise 让组件自动派生 loading
async function loadMore() {
  await new Promise(r => setTimeout(r, 600))
  const next = makePeople(Math.min(PAGE_SIZE, TOTAL - loaded.value), loaded.value)
  items.value = [...items.value, ...next]
  loaded.value += next.length
}

const canLoadMore = computed(() => loaded.value < TOTAL)

function reset() {
  items.value = []
  loaded.value = 0
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3">
      <UButton size="xs" variant="outline" icon="i-lucide-rotate-ccw" @click="reset">
        重置
      </UButton>
      <span class="text-xs text-muted tabular-nums">已加载 {{ loaded }} / {{ TOTAL }}</span>
    </div>
    <MDataTable
      :data="items"
      :columns="columns"
      :load-more="loadMore"
      :can-load-more="canLoadMore"
      :load-more-distance="100"
      :ui="{ root: 'h-[60vh]' }"
    />
  </div>
</template>
