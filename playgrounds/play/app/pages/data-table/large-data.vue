<script setup lang="ts">
import type { Person } from '../../composables/useMockData'

const columns = usePeopleColumns()
const items = ref<Person[]>([])
const page = ref(0)
const pageSize = 30
const total = ref(0)
const loading = ref(false)
const canLoadMore = computed(() => items.value.length < total.value || total.value === 0)

async function loadMore() {
  if (loading.value) return
  loading.value = true
  try {
    page.value++
    const res = await $fetch<{ data: { items: Person[], total: number } }>('/api/people', {
      query: { page: page.value, pageSize }
    })
    items.value = [...items.value, ...res.data.items]
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <Showcase
      title="无限滚动"
      :description="`loadMore + canLoadMore + sticky 表头 · 已加载 ${items.length} / ${total}`"
    >
      <MDataTable
        :data="items"
        :columns="columns"
        :load-more="loadMore"
        :can-load-more="canLoadMore"
        :loading="loading"
        :load-more-distance="120"
        load-more-immediate
        sticky
        bordered
        stripe
        :ui="{ root: 'h-[60vh]' }"
      />
    </Showcase>
  </div>
</template>
