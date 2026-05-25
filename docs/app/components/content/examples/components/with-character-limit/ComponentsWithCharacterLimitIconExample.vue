<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

const props = defineProps<{
  size: InputProps['size']
  leadingIcon: InputProps['leadingIcon']
  maxLength: string
}>()

const message = ref('')
const max = computed(() => Number(props.maxLength))
</script>

<template>
  <MWithCharacterLimit
    v-model="message"
    placeholder="写下你的想法..."
    :size
    :leading-icon
    :max-length="max"
  />
</template>
