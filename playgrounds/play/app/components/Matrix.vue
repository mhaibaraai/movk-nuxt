<script setup lang="ts" generic="T extends Record<string, string[]>">
type SlotProps = { [K in keyof T]: T[K] extends (infer U)[] ? U : never }

const props = defineProps<{
  attrs: T
  containerClass?: string
}>()

defineSlots<{
  default: (props: SlotProps) => unknown
}>()

const combinations = computed<SlotProps[]>(() => {
  const keys = Object.keys(props.attrs)
  const values = Object.values(props.attrs)

  if (keys.length === 0) return [{} as SlotProps]

  const result: SlotProps[] = []

  function generate(index: number, current: Record<string, string>) {
    if (index === keys.length) {
      result.push({ ...current } as unknown as SlotProps)
      return
    }
    const key = keys[index]
    const list = values[index] || []
    for (const value of list) {
      generate(index + 1, { ...current, [key as string]: value })
    }
  }

  generate(0, {})
  return result
})
</script>

<template>
  <div class="flex items-start gap-4 flex-wrap min-h-0 p-4">
    <template v-for="(combination, index) in combinations" :key="index">
      <div class="flex flex-col items-start gap-3" :class="containerClass">
        <slot v-bind="combination" />
      </div>
    </template>
  </div>
</template>
