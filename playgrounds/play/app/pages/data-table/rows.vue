<script setup lang="ts">
import type { TableRow } from '@nuxt/ui'
import type { Person } from '../../composables/useMockData'

const data = makePeople(15)
const columns = usePeopleColumns()

const rowSelection = ref<Record<string, boolean>>({})
const expanded = ref<Record<string, boolean>>({})
const selectOnRowClick = ref(true)

const log = ref<string[]>([])
function record(msg: string) {
  log.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...log.value].slice(0, 8)
}

function onSelect(_e: Event, row: TableRow<Person>) {
  record(`select: ${row.original.name}`)
}

function rowClass(row: Person): string {
  if (row.status === 'offboarded') return 'opacity-60'
  if (row.status === 'leave') return 'bg-warning-50/40 dark:bg-warning-900/10'
  return ''
}
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
    <Showcase title="行交互" description="rowSelection · expanded · onSelect · rowClass · selectOnRowClick">
      <template #toolbar>
        <USwitch v-model="selectOnRowClick" label="点行即选" />
      </template>

      <MDataTable
        v-model:row-selection="rowSelection"
        v-model:expanded="expanded"
        :columns="[{ type: 'selection' }, { type: 'expand' }, ...columns]"
        :data="data"
        :select-on-row-click="selectOnRowClick"
        :row-class="rowClass"
        bordered
        stripe
        :ui="{ root: 'max-h-[60vh]' }"
        @select="onSelect"
      >
        <template #expanded="{ row }">
          <div class="px-4 py-3 text-sm bg-elevated/30">
            <p>📧 {{ row.original.email }} · 入职 {{ row.original.joinedAt }}</p>
            <p>💰 {{ row.original.salary.toLocaleString() }} · {{ row.original.level }}</p>
          </div>
        </template>
      </MDataTable>
    </Showcase>

    <div class="flex flex-col gap-2">
      <StateViewer :state="rowSelection" label="rowSelection" />
      <StateViewer :state="expanded" label="expanded" />
      <StateViewer :state="log" label="select 事件" />
    </div>
  </div>
</template>
