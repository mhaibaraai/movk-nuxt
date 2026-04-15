<script setup lang="ts">
import type { DataTableDensityPreset } from '#movk/types/data-table'

const { users, groupingColumns } = useTableExamples()

const density = ref<DataTableDensityPreset>('compact')
const resizeMode = ref<'onChange' | 'onEnd'>('onChange')

const densityOptions = [
  { label: 'compact', value: 'compact' },
  { label: 'normal', value: 'normal' },
  { label: 'comfortable', value: 'comfortable' }
]

const resizeModeOptions = [
  { label: 'onEnd（释放后更新）', value: 'onEnd' },
  { label: 'onChange（默认、实时更新）', value: 'onChange' }
]
</script>

<template>
  <div class="space-y-4 p-6 overflow-auto max-w-3xl">
    <div>
      <h2 class="text-xl font-semibold mb-1">
        DataTable / Basic
      </h2>
      <p class="text-sm text-muted">
        最小可运行示例，展示基础列定义与数据渲染。
      </p>
    </div>

    <div class="flex items-center gap-6">
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted shrink-0">密度</span>
        <USelectMenu
          v-model="density"
          :items="densityOptions"
          value-key="value"
          size="sm"
          class="w-36"
        />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted shrink-0">resizeMode</span>
        <USelectMenu
          v-model="resizeMode"
          :items="resizeModeOptions"
          value-key="value"
          size="sm"
          class="w-52"
        />
      </div>
    </div>

    <MDataTable
      :data="users"
      :columns="groupingColumns"
      :density="density"
      :column-resize-mode="resizeMode"
      :resizable="true"
      :sortable="false"
      :pinable="false"
      :bordered="true"
      :fixed-layout="true"
    />
  </div>
</template>
