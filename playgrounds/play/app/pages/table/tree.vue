<script setup lang="ts">
import type { ExpandedState, RowSelectionState } from '@tanstack/vue-table'

const { treeData, treeColumns } = useTableExamples()

const expanded = ref<ExpandedState>()
const selection = ref<RowSelectionState>()
const visibility = ref()

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
      :data="treeData"
      :columns="treeColumns"
      expand-on-row-click
      children-key="children"
      row-key="id"
      :expanded-keys="['4597']"
      @select="onClick"
    >
      <!-- <template #expand-icon="{ expanded }">
        <UIcon
          :name="expanded ? 'i-lucide-folder-open' : 'i-lucide-folder'"
          class="size-4"
        />
      </template> -->
    </MDataTable>
    {{ expanded }}
    {{ selection }}
    {{ visibility }}
  </div>
</template>
