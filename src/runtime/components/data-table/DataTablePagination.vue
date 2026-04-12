<script setup lang="ts">
import type { DataTablePaginationPassthrough } from '../../types/data-table'
import { UPagination, USelect } from '#components'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** 总数据条数 */
  total: number
  /**
   * 可选每页条数列表，长度大于 1 时显示切换器
   * @defaultValue []
   */
  pageSizes?: number[]
  /** UPagination 额外 props 透传 */
  paginationProps?: DataTablePaginationPassthrough
  /**
   * 当前已选行数，用于分页栏显示
   * @defaultValue 0
   */
  selectedCount?: number
}>(), {
  pageSizes: () => [],
  selectedCount: 0
})

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

defineSlots<{
  left: (props: { total: number, selectedCount: number }) => unknown
  right: (props: { total: number }) => unknown
}>()

const pageSizeOptions = computed(() =>
  props.pageSizes.map(size => ({
    label: `${size} 条/页`,
    value: size
  }))
)

const showPageSizeSelect = computed(() => props.pageSizes.length > 1)
</script>

<template>
  <div class="flex items-center justify-between py-3 px-2">
    <div class="flex items-center gap-2 text-sm text-muted">
      <slot name="left" :total="total" :selected-count="selectedCount">
        <span>共 {{ total }} 条</span>
        <span v-if="selectedCount > 0">，已选 {{ selectedCount }} 条</span>
      </slot>
    </div>

    <div class="flex items-center gap-3">
      <USelect
        v-if="showPageSizeSelect"
        :model-value="pageSize"
        :items="pageSizeOptions"
        size="xs"
        class="w-28"
        @update:model-value="pageSize = Number($event)"
      />

      <UPagination
        v-model:page="page"
        :total="total"
        :items-per-page="pageSize"
        v-bind="paginationProps"
      />

      <slot name="right" :total="total" />
    </div>
  </div>
</template>
