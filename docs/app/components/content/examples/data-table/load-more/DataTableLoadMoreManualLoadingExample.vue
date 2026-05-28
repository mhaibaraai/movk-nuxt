<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const PAGE_SIZE = 12
const TOTAL = 48
const items = ref<Person[]>([])
const loaded = ref(0)
const loading = ref(false)

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 90 },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门', size: 90 }
]

// 同步返回（不交回 Promise），由调用方自行接管 loading
function loadMore(): void {
  if (loading.value) return
  loading.value = true
  setTimeout(() => {
    const next = makePeople(Math.min(PAGE_SIZE, TOTAL - loaded.value), loaded.value)
    items.value = [...items.value, ...next]
    loaded.value += next.length
    loading.value = false
  }, 600)
}

const canLoadMore = computed(() => loaded.value < TOTAL)

function reset(): void {
  items.value = []
  loaded.value = 0
  loading.value = false
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3">
      <UButton size="xs" variant="outline" icon="i-lucide-rotate-ccw" @click="reset">
        重置
      </UButton>
      <UBadge :color="loading ? 'primary' : 'neutral'" variant="subtle" size="sm">
        {{ loading ? 'loading…' : 'idle' }}
      </UBadge>
      <span class="text-xs text-muted tabular-nums">已加载 {{ loaded }} / {{ TOTAL }}</span>
    </div>
    <MDataTable
      :data="items"
      :columns="columns"
      :load-more="loadMore"
      :can-load-more="canLoadMore"
      :loading="loading"
      bordered
      :ui="{ root: 'h-[50vh]' }"
    />
  </div>
</template>
