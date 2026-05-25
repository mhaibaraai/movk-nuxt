<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

const props = defineProps<{
  size: InputProps['size']
  maxLength: string
}>()

const text = ref('')
const max = computed(() => Number(props.maxLength))
</script>

<template>
  <MWithCharacterLimit
    v-model="text"
    placeholder="Size demo"
    :size
    :max-length="max"
  />
</template>
