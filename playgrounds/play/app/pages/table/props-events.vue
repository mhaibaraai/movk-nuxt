<script setup lang="ts">
import type {
  DataTableContextmenuHandler,
  DataTableHoverHandler,
  DataTableSelectHandler,
  DataTableStateChangeHandler
} from '#movk/types/data-table'
import type { TableUser } from '~/composables/useTableExamples'

const { users, selectionColumns } = useTableExamples()

const tableData = ref<TableUser[]>([...users])
const selectedKeys = ref([])
const clickMessage = ref('点击任意行查看 row-click 回调结果。')
const contextMenuMessage = ref('在任意行上右键触发 onRowContextmenu。')

const onSelect: DataTableSelectHandler<TableUser> = (_event, _row) => {
  console.log('onSelect', _row)
}

const onContextmenu: DataTableContextmenuHandler<TableUser> = (event, _row) => {
  console.log(event)
}

const onHover: DataTableHoverHandler<TableUser> = (_event, _row) => {}

const onStateChange: DataTableStateChangeHandler = (_updater) => {}

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
        演示
        <code>rowClass</code>、<code>rowStyle</code>、<code>stripeClass</code>、<code>rowKey</code>、<code>onRowClick</code>、<code>onRowContextmenu</code>。
      </p>
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
      @state-change="onStateChange"
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
