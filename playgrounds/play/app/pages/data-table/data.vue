<script setup lang="ts">
import type { Person } from '../../composables/useMockData'

const mode = ref<'client' | 'server'>('server')
const columns = usePeopleColumns()

const clientData = makePeople(80)
const clientPagination = ref({ pageIndex: 0, pageSize: 10 })

const serverPagination = ref({ pageIndex: 0, pageSize: 10 })
const sorting = ref<{ id: string, desc: boolean }[]>([])
const keyword = ref('')

const queryUrl = computed(() => {
  const sort = sorting.value[0]
  const params = new URLSearchParams({
    page: String(serverPagination.value.pageIndex + 1),
    pageSize: String(serverPagination.value.pageSize),
    keyword: keyword.value
  })
  if (sort) {
    params.set('sortBy', sort.id)
    params.set('sortDir', sort.desc ? 'desc' : 'asc')
  }
  return `/api/people?${params.toString()}`
})

const { data, pending, refresh } = useApiFetch<{ items: Person[], total: number }>(
  () => queryUrl.value,
  { watch: [queryUrl] }
)

const serverItems = computed<Person[]>(() => data.value?.items ?? [])
const serverTotal = computed(() => data.value?.total ?? 0)
</script>

<template>
  <Navbar />

  <div class="p-4 flex flex-col gap-4">
    <Showcase title="客户端 vs 服务端分页">
      <template #toolbar>
        <UTabs
          v-model="mode"
          :items="[{ label: '客户端', value: 'client' }, { label: '服务端 /api/people', value: 'server' }]"
          size="xs"
        />
      </template>

      <template v-if="mode === 'client'">
        <MDataTable
          v-model:pagination="clientPagination"
          :data="clientData"
          :columns="columns"
          sortable
          bordered
          :ui="{ root: 'max-h-[60vh]' }"
        />
      </template>

      <template v-else>
        <div class="flex items-center gap-2">
          <UInput
            v-model="keyword"
            size="sm"
            placeholder="搜索姓名/邮箱/岗位"
            icon="i-lucide-search"
            @update:model-value="serverPagination.pageIndex = 0"
          />
          <UButton size="sm" variant="outline" icon="i-lucide-refresh-cw" :loading="pending" @click="() => refresh()">
            刷新
          </UButton>
          <span class="text-xs text-muted ms-auto">total: {{ serverTotal }}</span>
        </div>

        <MDataTable
          v-model:pagination="serverPagination"
          v-model:sorting="sorting"
          :data="serverItems"
          :columns="columns"
          :loading="pending"
          sortable
          bordered
          :pagination-options="{ manualPagination: true, rowCount: serverTotal }"
          :sorting-options="{ manualSorting: true }"
          :ui="{ root: 'max-h-[60vh]' }"
        />
      </template>
    </Showcase>
  </div>
</template>
