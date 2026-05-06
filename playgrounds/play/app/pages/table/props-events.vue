<script setup lang="ts">
import type { TableRow } from '@nuxt/ui'
import type { TableUser } from '~/composables/useTableExamples'

const { users, selectionColumns } = useTableExamples()

const tableData = ref<TableUser[]>([...users])
const selectedKeys = ref([])
const clickMessage = ref('点击任意行查看 row-click 回调结果。')
const contextMenuMessage = ref('在任意行上右键触发 onRowContextmenu。')

function onSelect(_event: Event, _row: TableRow<TableUser>) {
}

function onContextmenu(_event: Event, _row: TableRow<TableUser>) {
}

function onHover(_event: Event, _row: TableRow<TableUser> | null) {
}

function reloadData() {
  const reversed = [...users].reverse()
  tableData.value = reversed.map((item, idx) => ({
    ...item,
    id: item.id + 100 + idx
  }))
}

function resetData() {
  tableData.value = [...users]
}

function rowClass(row: TableUser) {
  if (row.status === 'inactive') return 'bg-error/5'
  if (row.status === 'pending') return 'bg-warning/5'
  return ''
}

function rowStyle(row: TableUser) {
  if (row.salary == null) {
    return {
      fontStyle: 'italic'
    }
  }

  return ''
}
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Props & Events
      </h2>
      <p class="text-sm text-muted">
        演示 <code>rowClass</code>、<code>rowStyle</code>、<code>stripeClass</code>、<code>rowKey</code>、<code>onRowClick</code>、<code>onRowContextmenu</code>。
      </p>
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <UButton color="neutral" variant="soft" @click="reloadData">
        刷新数据（替换 ID）
      </UButton>
      <UButton color="neutral" variant="ghost" @click="resetData">
        重置数据
      </UButton>
    </div>

    <MDataTable
      v-model:row-selection-keys="selectedKeys"
      :data="tableData"
      :columns="selectionColumns"
      row-key="id"
      stripe
      stripe-class="odd:bg-primary/5"
      bordered
      :row-class="rowClass"
      :row-style="rowStyle"
      @select="onSelect"
      @contextmenu="onContextmenu"
      @hover="onHover"
    />

    <p class="text-sm text-muted">
      {{ clickMessage }}
    </p>
    <p class="text-sm text-muted">
      {{ contextMenuMessage }}
    </p>
    <p class="text-sm text-muted">
      当前选中：{{ selectedKeys.length > 0 ? selectedKeys.join('、') : '无' }}
    </p>
  </div>
</template>
