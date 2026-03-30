<script lang="ts" setup>
import type { StarRatingProps } from '#movk/components/StarRating.vue'

defineProps<Pick<StarRatingProps, 'modelValue' | 'max' | 'disabled'>>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function handleChange(value: number) {
  emit('update:modelValue', value)
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
