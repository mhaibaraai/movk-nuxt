<script setup lang="ts">
import type { DataTableColumn } from '@movk/nuxt'
import type { Person } from '~/composables/useTableMock'

const PAGE_SIZE = 12
const TOTAL = 60
const items = ref<Person[]>([])
const loaded = ref(0)
const distance = ref(100)

const columns: DataTableColumn<Person>[] = [
  { accessorKey: 'id', header: '工号', size: 90 },
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'department', header: '部门', size: 90 }
]

async function loadMore() {
  await new Promise(r => setTimeout(r, 500))
  const next = makePeople(Math.min(PAGE_SIZE, TOTAL - loaded.value), loaded.value)
  items.value = [...items.value, ...next]
  loaded.value += next.length
}

const canLoadMore = computed(() => loaded.value < TOTAL)

function reset(): void {
  items.value = []
  loaded.value = 0
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3">
      <USelect
        v-model="distance"
        :items="[
          { label: 'distance 40（贴底触发）', value: 40 },
          { label: 'distance 100（默认）', value: 100 },
          { label: 'distance 240（提前触发）', value: 240 }
        ]"
        value-key="value"
        size="xs"
        class="w-52"
      />
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
      :load-more-distance="distance"
      bordered
      :ui="{ root: 'h-[50vh]' }"
    />
  </div>
</template>
