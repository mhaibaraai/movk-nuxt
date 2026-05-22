<script setup lang="ts" generic="T extends Record<string, string[]>">
type SlotProps = { [K in keyof T]: T[K] extends (infer U)[] ? U : never }

const props = defineProps<{
  attrs: T
  cellClass?: string
}>()

defineSlots<{
  default: (props: SlotProps) => unknown
}>()

const keys = computed(() => Object.keys(props.attrs))
const colKey = computed<string | undefined>(() => keys.value[0])
const rowKey = computed<string | undefined>(() => keys.value[1])

const source = computed(() => props.attrs as Record<string, string[]>)
const colValues = computed<string[]>(() => (colKey.value ? source.value[colKey.value] ?? [] : []))
const rowValues = computed<(string | undefined)[]>(() =>
  rowKey.value ? source.value[rowKey.value] ?? [] : [undefined]
)

function combo(colVal: string, rowVal: string | undefined): SlotProps {
  const result: Record<string, string> = {}
  if (colKey.value) result[colKey.value] = colVal
  if (rowKey.value && rowVal !== undefined) result[rowKey.value] = rowVal
  return result as unknown as SlotProps
}

const templateColumns = computed(() => {
  const lead = rowKey.value ? 'auto ' : ''
  return `${lead}repeat(${colValues.value.length || 1}, max-content)`
})
</script>

<template>
  <div class="overflow-x-auto p-4 shrink-0">
    <div class="grid items-start gap-x-4 gap-y-3 w-max" :style="{ gridTemplateColumns: templateColumns }">
      <div v-if="rowKey" />
      <div
        v-for="col in colValues"
        :key="`head-${col}`"
        class="text-xs text-muted font-medium text-center pb-1"
      >
        {{ col }}
      </div>

      <template v-for="row in rowValues" :key="`row-${row ?? 'only'}`">
        <div v-if="rowKey" class="text-xs text-muted font-medium pr-2 text-right self-center">
          {{ row }}
        </div>
        <div
          v-for="col in colValues"
          :key="`cell-${row ?? 'only'}-${col}`"
          class="flex flex-col items-start gap-2"
          :class="cellClass"
        >
          <slot v-bind="combo(col, row)" />
        </div>
      </template>
    </div>
  </div>
</template>
