<script lang="ts" setup>
import type { StarRatingProps } from '#movk/components/StarRating.vue'

defineProps<Pick<StarRatingProps, 'modelValue' | 'max' | 'disabled'>>()

const emits = defineEmits<{
  'update:modelValue': [value: number]
}>()

function handleChange(value: number) {
  emits('update:modelValue', value)
}
</script>

<template>
  <MStarRating
    :model-value="modelValue"
    :max="max"
    :disabled="disabled"
    @update:model-value="handleChange"
  />
</template>
