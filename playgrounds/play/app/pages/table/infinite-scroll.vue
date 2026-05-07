<script setup lang="ts">
const { largeUsers, sortingColumns } = useTableExamples()

const batchSize = 20
const users = ref<typeof largeUsers>([])

const canLoadMore = computed(() => users.value.length < largeUsers.length)

async function loadMore() {
  await new Promise(resolve => setTimeout(resolve, 300))
  const start = users.value.length
  users.value = [...users.value, ...largeUsers.slice(start, start + batchSize)]
}
</script>

<template>
  <div class="space-y-4 p-6 max-h-150 flex flex-col overflow-hidden">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Infinite Scroll
      </h2>
      <p class="text-sm text-muted">
        演示滚动触底加载更多，当前已加载 {{ users.length }} / {{ largeUsers.length }} 条。
      </p>
    </div>

    <MDataTable
      :data="users"
      :columns="sortingColumns"
      bordered
      class="flex-1"
      :load-more-distance="80"
      :can-load-more="canLoadMore"
      :load-more="loadMore"
      load-more-immediate
    />

    <p class="text-sm text-muted">
      {{ canLoadMore ? '继续向下滚动以加载更多数据。' : '已加载全部数据。' }}
    </p>
  </div>
</template>
