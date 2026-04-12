<script setup lang="ts">
const { largeUsers, sortingColumns } = useTableExamples()

const batchSize = 20
const loadedCount = ref(batchSize)

const visibleUsers = computed(() => largeUsers.slice(0, loadedCount.value))
const canLoadMore = computed(() => loadedCount.value < largeUsers.length)

function handleLoadMore() {
  if (!canLoadMore.value) return

  loadedCount.value = Math.min(
    loadedCount.value + batchSize,
    largeUsers.length
  )
}
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Infinite Scroll
      </h2>
      <p class="text-sm text-muted">
        演示滚动触底加载更多，当前已加载 {{ loadedCount }} / {{ largeUsers.length }} 条。
      </p>
    </div>

    <MDataTable
      :data="visibleUsers"
      :columns="sortingColumns"
      infinite-scroll
      :infinite-scroll-height="'360px'"
      :infinite-scroll-distance="80"
      :can-load-more="canLoadMore"
      bordered
      @load-more="handleLoadMore"
    />

    <p class="text-sm text-muted">
      {{ canLoadMore ? '继续向下滚动以加载更多数据。' : '已加载全部数据。' }}
    </p>
  </div>
</template>
