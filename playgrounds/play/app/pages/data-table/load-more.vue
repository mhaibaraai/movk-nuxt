<script setup lang="ts">
import type { Person } from '../../composables/useMockData'

const PAGE_SIZE = 15
const columns = usePeopleColumns()

const items = ref<Person[]>([])
const total = ref(0)
const page = ref(0)

const distance = ref(100)
const stop = ref(false)
const externalLoadingMode = ref(false)
const externalLoading = ref(false)

const tableKey = ref(0)

async function fetchPage() {
  const next = page.value + 1
  const res = await $fetch<{ data: { items: Person[], total: number } }>('/api/people', {
    query: { page: next, pageSize: PAGE_SIZE }
  })
  items.value = [...items.value, ...res.data.items]
  total.value = res.data.total
  page.value = next
}

async function loadMore() {
  if (!externalLoadingMode.value) {
    await fetchPage()
    return
  }
  // 显式 loading 形态：调用方接管 loading，函数体不返回 Promise 给组件派生
  if (externalLoading.value) return
  externalLoading.value = true
  fetchPage().finally(() => {
    externalLoading.value = false
  })
}

// total === 0 表示尚未加载，允许挂载时填充首屏
const canLoadMore = computed(() => !stop.value && (total.value === 0 || items.value.length < total.value))

function reset() {
  items.value = []
  total.value = 0
  page.value = 0
  externalLoading.value = false
  tableKey.value++
}
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <Showcase
      title="触底加载"
      description="loadMore 触发触底加载，配合 loadMoreDistance、canLoadMore、loading 演示无限滚动。"
    >
      <template #toolbar>
        <UButton size="xs" variant="outline" icon="i-lucide-rotate-ccw" @click="reset">
          重置
        </UButton>
        <span class="text-xs text-muted tabular-nums">
          已加载 {{ items.length }} / {{ total || '?' }}
        </span>
      </template>

      <template #aside>
        <div class="flex flex-col gap-3 p-3 rounded-md border border-default bg-elevated/40">
          <span class="text-xs font-medium text-default">行为开关</span>

          <div class="flex flex-col gap-1.5">
            <USwitch v-model="stop" label="canLoadMore = false" />
            <span class="text-xs text-muted">强制停止后 loadMore 不再触发</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <USwitch v-model="externalLoadingMode" label="显式 loading" />
            <span class="text-xs text-muted">同步包装 loadMore 并接管 loading prop</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <span class="text-xs">loadMoreDistance</span>
            <USelect
              v-model="distance"
              :items="[
                { label: '40 (贴底)', value: 40 },
                { label: '100 (默认)', value: 100 },
                { label: '240 (提前)', value: 240 }
              ]"
              value-key="value"
              size="xs"
            />
          </div>

          <div v-if="externalLoadingMode" class="flex items-center gap-2 pt-1">
            <span class="text-xs text-muted">外部 loading</span>
            <UBadge :color="externalLoading ? 'primary' : 'neutral'" variant="subtle" size="sm">
              {{ externalLoading ? 'loading…' : 'idle' }}
            </UBadge>
          </div>
        </div>
      </template>

      <MDataTable
        :key="tableKey"
        :data="items"
        :columns="columns"
        :load-more="loadMore"
        :can-load-more="canLoadMore"
        :load-more-distance="distance"
        :loading="externalLoadingMode ? externalLoading : undefined"
        bordered
        :ui="{ root: 'h-[60vh]' }"
      />
    </Showcase>
  </div>
</template>
