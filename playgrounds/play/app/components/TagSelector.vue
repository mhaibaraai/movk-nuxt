<script setup lang="ts">
import { UBadge } from '#components'

export interface TagSelectorProps {
  /**
   * 可选标签列表
   */
  options?: string[]
  /**
   * 最多可选数量（不填表示不限制）
   */
  max?: number
  /**
   * 禁用状态
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<TagSelectorProps>(), {
  options: () => [],
  disabled: false
})

const model = defineModel<string[]>({ default: () => [] })

function isSelected(tag: string) {
  return (model.value ?? []).includes(tag)
}

function isMaxReached(tag: string) {
  const current = model.value ?? []
  return !!props.max && current.length >= props.max && !current.includes(tag)
}

function toggle(tag: string) {
  if (props.disabled || isMaxReached(tag)) return

  const current = model.value ?? []
  model.value = current.includes(tag)
    ? current.filter(t => t !== tag)
    : [...current, tag]
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-if="options.length === 0"
      class="text-sm text-muted"
    >
      暂无可选标签
    </div>
    <div
      v-else
      class="flex flex-wrap gap-2"
    >
      <UBadge
        v-for="tag in options"
        :key="tag"
        :label="tag"
        :variant="isSelected(tag) ? 'solid' : 'outline'"
        color="primary"
        class="transition-opacity select-none"
        :class="[
          disabled || isMaxReached(tag)
            ? 'opacity-40 cursor-not-allowed'
            : 'cursor-pointer hover:opacity-80'
        ]"
        @click="toggle(tag)"
      />
    </div>
    <p
      v-if="max"
      class="text-xs text-muted"
    >
      已选 {{ (model ?? []).length }} / {{ max }}
    </p>
  </div>
</template>
