<script setup lang="ts">
import type { ExpandedState, RowSelectionState, VisibilityState } from '@tanstack/vue-table'

const { treeData, treeColumns } = useTableExamples()

const expanded = ref<ExpandedState>()
const selection = ref<RowSelectionState>()
const visibility = ref<VisibilityState>()
const expandedKeys = ref(['4600'])
const rowSelectionKeys = ref(['4600'])
const visibilityExcludeKeys = ref(['email'])

function onClick(row: any) {
  console.log('Row clicked:', row)
}
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Tree
      </h2>
      <p class="text-sm text-muted">
        演示树形数据展示、展开列、默认展开、缩进宽度与行点击展开。
      </p>
    </div>

    <MDataTable
      v-model:row-selection="selection"
      v-model:expanded="expanded"
      v-model:column-visibility="visibility"
      v-model:expanded-keys="expandedKeys"
      v-model:row-selection-keys="rowSelectionKeys"
      v-model:column-visibility-exclude-keys="visibilityExcludeKeys"
      :data="treeData"
      :columns="treeColumns"
      expand-on-row-click
      children-key="children"
      row-key="id"
      @select="onClick"
    >
      <!-- <template #expand-icon="{ expanded }">
        <UIcon
          :name="expanded ? 'i-lucide-folder-open' : 'i-lucide-folder'"
          class="size-4"
        />
      </template> -->
    </MDataTable>
    expanded: {{ expanded }}
    expandedKeys: {{ expandedKeys }}
    selection: {{ selection }}
    visibilityExcludeKeys: {{ visibilityExcludeKeys }}
  </div>
</template>
